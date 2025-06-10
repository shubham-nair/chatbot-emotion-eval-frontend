import React, { useState } from 'react';
import { Upload, Button, Table, Typography, Alert, Space, message, Card, Collapse, Row, Col, Layout } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { uploadFile } from './services/api';

const { Title } = Typography;
const { Panel } = Collapse;

// Helper function to parse data that may be in Pandas 'split' orientation or 'records' format
const parsePandasFormat = (data) => {
    if (data && Array.isArray(data.columns) && Array.isArray(data.data)) {
        return data.data.map(row => {
            const rowObject = {};
            data.columns.forEach((col, index) => {
                rowObject[col] = row[index];
            });
            return rowObject;
        });
    }
    return Array.isArray(data) ? data : [];
};

const sampleInputJson = `[
  {"session_id": "s1", "model_version": "Alpha", "dialogue": [
    {"user_input": "I'm having a really awful day.", "bot_reply": "I'm sorry to hear that..."}
  ]},
  {"session_id": "s2", "model_version": "Omega", "dialogue": [
    {"user_input": "I'm feeling lonely...", "bot_reply": "The weather is nice today."}
  ]}
]`;

const sampleOutputJson = `{
  "detail": [
    { "session_id": "s1", "f1_avg": 0.4713, "...": "..." }
  ],
  "summary": [
    { "model_version": "Alpha", "f1_avg": 0.3838, "...": "..." }
  ]
}`;

const summaryColumns = [
    { title: 'Model', dataIndex: 'model_version', key: 'model_version', align: 'center' },
    { title: 'Avg F1', dataIndex: 'f1_avg', key: 'f1_avg', align: 'center', render: val => val != null ? val.toFixed(4) : '--' },
    { title: 'Avg Precision', dataIndex: 'precision_avg', key: 'precision_avg', align: 'center', render: val => val != null ? val.toFixed(4) : '--' },
    { title: 'Avg Recall', dataIndex: 'recall_avg', key: 'recall_avg', align: 'center', render: val => val != null ? val.toFixed(4) : '--' },
    { title: 'Avg Emotion Lift', dataIndex: 'emotion_slope', key: 'emotion_slope', align: 'center', render: val => val != null ? val.toFixed(4) : '--' },
    { title: 'Cumulative Gain', dataIndex: 'cumulative_gain', key: 'cumulative_gain', align: 'center', render: val => val != null ? val.toFixed(4) : '--' },
    { title: 'Sessions', dataIndex: 'count', key: 'count', align: 'center' },
];

const detailColumns = [
    { title: 'Session ID', dataIndex: 'session_id', key: 'session_id', align: 'center', sorter: (a, b) => String(a.session_id).localeCompare(String(b.session_id), undefined, { numeric: true }), defaultSortOrder: 'ascend' },
    { title: 'Model', dataIndex: 'model_version', key: 'model_version', align: 'center' },
    { title: 'F1', dataIndex: 'f1_avg', key: 'f1_avg', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Precision', dataIndex: 'precision_avg', key: 'precision_avg', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Recall', dataIndex: 'recall_avg', key: 'recall_avg', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Start Sentiment', dataIndex: 'start_sentiment', key: 'start_sentiment', align: 'center', render: val => val?.toFixed(4) },
    { title: 'End Sentiment', dataIndex: 'end_sentiment', key: 'end_sentiment', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Emotion Lift', dataIndex: 'emotion_slope', key: 'emotion_slope', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Cumulative Gain', dataIndex: 'cumulative_gain', key: 'cumulative_gain', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Avg Bot Sentiment', dataIndex: 'avg_bot_sentiment', key: 'avg_bot_sentiment', align: 'center', render: val => val?.toFixed(4) },
    { title: 'Turns', dataIndex: 'turns', key: 'turns', align: 'center' },
];

const chartMetrics = [
    { key: 'f1_avg', name: 'Avg F1', color: '#4a90e2' },
    { key: 'precision_avg', name: 'Precision', color: '#8bc34a' },
    { key: 'recall_avg', name: 'Recall', color: '#ffc107' },
    { key: 'emotion_slope', name: 'Emotion Lift', color: '#ff6f91' },
];


const AboutSection = ({ isInitialState }) => {
    if (!isInitialState) return null;
    return (
        <Card title={<Title level={3}>About AI Buddy Evaluator</Title>} bordered={false} style={{ background: '#fff', borderRadius: '8px', marginBottom: 24 }}>
            <Typography.Paragraph>
                Evaluating a chatbot's quality goes deeper than just checking for correct answers. It's about understanding its impact on the user's emotions. We built AI Buddy Evaluator because traditional tools don't measure this crucial human element.
            </Typography.Paragraph>
        </Card>
    );
};

const App = () => {
    const [result, setResult] = useState(null);
    const [rawResponse, setRawResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAllDetails, setShowAllDetails] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleDownload = () => {
        if (!rawResponse) {
            message.error("No raw response data available to download.");
            return;
        }
        const jsonString = JSON.stringify(rawResponse, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'evaluation_results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleReset = () => {
        setResult(null);
        setRawResponse(null);
        setError(null);
        setFileList([]);
        setShowAllDetails(false);
    };

    const handleApiResponse = (response) => {
        const detailedData = parsePandasFormat(response.detail || response.detailed_results || response.detail_df);
        const summaryData = parsePandasFormat(response.summary || response.summary_table || response.summary_df);
        
        const finalResult = {
            detail: detailedData,
            summary: summaryData,
        };

        if (finalResult.detail.length === 0 && finalResult.summary.length === 0) {
            throw new Error("Processing succeeded, but the response contained no valid result data.");
        }
        setResult(finalResult);
        setRawResponse(response);
        message.success(`Data processed successfully.`);
    };
    
    const draggerProps = {
        name: 'file',
        multiple: false,
        accept: '.json',
        fileList: fileList,
        customRequest: async ({ file, onSuccess, onError }) => {
            setLoading(true);
            setError(null);
            setResult(null);
            setRawResponse(null);
            setFileList([file]); 

            try {
                const response = await uploadFile(file);
                handleApiResponse(response);
                onSuccess();
            } catch (err) {
                console.error('Upload error:', err);
                const errorMsg = err.response?.data?.detail?.[0]?.msg || err.message || 'File upload failed.';
                setError(errorMsg);
                message.error(errorMsg);
                onError(err);
                setFileList([]); 
            } finally {
                setLoading(false);
            }
        },
        onRemove: () => {
            handleReset();
        }
    };
    
    const isInitialState = !loading && !result && !error;

    return (
        <Layout style={{ minHeight: '100vh', padding: '24px', background: '#f0f2f5' }}>
            <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                <Title level={1} style={{ textAlign: 'center', marginBottom: '24px', color: '#1890ff' }}>
                    AI Buddy Evaluator
                </Title>

                <AboutSection isInitialState={isInitialState} />

                {isInitialState && (
                    <>
                        {/* FIX: The Sample Data card has been restored here */}
                        <Card title={<Title level={4}>Sample Data & Format Guide</Title>} bordered={false} style={{ background: '#fff', borderRadius: '8px', marginBottom: 24 }}>
                            <Collapse accordion>
                                <Panel header="Sample Input JSON Format" key="1">
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f8f8', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                                        {sampleInputJson}
                                    </pre>
                                </Panel>
                                <Panel header="Sample Output JSON (from Backend)" key="2">
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f8f8', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                                        {sampleOutputJson}
                                    </pre>
                                </Panel>
                            </Collapse>
                        </Card>

                        <Card title={<Title level={3}>Upload Your Chat Log File</Title>} bordered={false} style={{ background: '#fff', borderRadius: '8px' }}>
                            <Upload.Dragger {...draggerProps} style={{ padding: '20px' }}>
                                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                <p className="ant-upload-text">Click or drag JSON file to this area to upload</p>
                            </Upload.Dragger>
                        </Card>
                    </>
                )}

                {loading && <Alert message="Processing your data... This may take a moment." type="info" showIcon style={{ marginBottom: 24 }} />}
                
                {error && (
                    <Card>
                        <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
                        <Button type="primary" onClick={handleReset}>Try Again</Button>
                    </Card>
                )}

                {!loading && result && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        
                        {Array.isArray(result.summary) && result.summary.length > 0 && (
                           <Card
                                title={<Title level={4}>Evaluation Summary (Aggregated by Model)</Title>}
                                headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #d6eaff'}}
                                bordered={false} style={{ background: '#fff', borderRadius: '8px' }}
                            >
                                <Table dataSource={result.summary} columns={summaryColumns} rowKey="model_version" pagination={false} bordered size="middle" />
                            </Card>
                        )}
                        
                        {Array.isArray(result.detail) && result.detail.length > 0 ? (
                            <Card
                                title={<Title level={4}>Detailed Results (Per Session)</Title>}
                                headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #d6eaff'}}
                                extra={<Button icon={<DownloadOutlined />} onClick={handleDownload} type="primary" ghost>Download JSON</Button>}
                                bordered={false} style={{ background: 'white', borderRadius: '8px' }}
                            >
                                <Table
                                    dataSource={showAllDetails ? result.detail : result.detail.slice(0, 5)}
                                    columns={detailColumns}
                                    rowKey="session_id"
                                    pagination={false}
                                    bordered
                                    size="middle"
                                />
                                {result.detail.length > 5 && (
                                    <Button type="link" onClick={() => setShowAllDetails(!showAllDetails)} style={{ marginTop: 10 }}>
                                        {showAllDetails ? 'Show Less' : `Show All (${result.detail.length} sessions)`}
                                    </Button>
                                )}
                            </Card>
                        ) : null }
                        
                        {Array.isArray(result.summary) && result.summary.length > 0 && (
                            <Card
                                title={<Title level={4}>Performance Charts</Title>}
                                headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #d6eaff'}}
                                bordered={false} style={{ background: '#fff', borderRadius: '8px' }}
                            >
                                <Row gutter={[24, 24]}>
                                    {chartMetrics.map(metric => (
                                        <Col xs={24} md={12} lg={8} key={metric.key}>
                                            <Title level={5} style={{ textAlign: 'center' }}>{metric.name}</Title>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={result.summary} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                                    <XAxis dataKey="model_version" />
                                                    <YAxis tickFormatter={(tick) => tick.toFixed(2)} />
                                                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value} />
                                                    <Legend />
                                                    <Bar dataKey={metric.key} fill={metric.color} name={metric.name}>
                                                        <LabelList dataKey={metric.key} position="top" formatter={(value) => value.toFixed(3)} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        )}
                        
                        <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            onClick={handleReset}
                            style={{ marginTop: 24, alignSelf: 'center' }}
                            size="large"
                        >
                            Evaluate Another Dataset
                        </Button>
                    </Space>
                )}

                <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e8e8e8', color: '#888' }}>
                    For more details, visit our{' '}
                    <a href="https://github.com/shubham-nair/chatbot-emotion-eval-frontend" target="_blank" rel="noopener noreferrer">Frontend Repo</a> and{' '}
                    <a href="https://github.com/shubham-nair/EmotionEval_Chat-model-evaluate" target="_blank" rel="noopener noreferrer">Backend Repo</a>.
                    <br />
                    &copy; {new Date().getFullYear()} AI Buddy Evaluator. All rights reserved.
                </div>
            </Space>
        </Layout>
    );
}

export default App;