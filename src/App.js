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
    {"user_input": "I'm having a really awful day.", "bot_reply": "I'm sorry to hear that. It's okay to have off days, remember that you're not alone in feeling this way."},
    {"user_input": "Thanks for saying that. I've just been under a lot of stress.", "bot_reply": "I understand. When you're stressed, it's important to be kind to yourself. You've been handling a lot."},
    {"user_input": "Hearing you say that actually helps.", "bot_reply": "I'm glad I could offer some comfort. If you ever need to talk, I'm always here."}
  ]},
  {"session_id": "s2", "model_version": "Omega", "dialogue": [
    {"user_input": "I'm feeling lonely and no one understands me.", "bot_reply": "The weather is quite nice today. Have you eaten lunch?"},
    {"user_input": "I'm really upset, I wish someone would listen.", "bot_reply": "Do you own any pets?"},
    {"user_input": "It feels like you're not listening to me.", "bot_reply": "What is your name?"}
  ]},
  {"session_id": "s3", "model_version": "Alpha", "dialogue": [
    {"user_input": "I don't know how to prepare for my interview tomorrow, I'm so anxious.", "bot_reply": "I understand your anxiety. We could start by practicing some common interview questions to build your confidence. Just let me know if you need help."},
    {"user_input": "What are some common questions?", "bot_reply": "Questions like 'Tell me about yourself,' 'Describe your project experience,' and 'What are your strengths and weaknesses?' are very typical."},
    {"user_input": "That gives me a starting point. Thank you.", "bot_reply": "You've got this! Go for it! And feel free to ask me anything else."}
  ]},
  {"session_id": "s4", "model_version": "Omega", "dialogue": [
    {"user_input": "I feel like I can't do anything right, I'm such a failure.", "bot_reply": "Keep going. Try harder."},
    {"user_input": "Sometimes I feel so tired, I don't want to keep trying.", "bot_reply": "What did you eat today?"},
    {"user_input": "I just want some encouragement, but you don't seem to get it.", "bot_reply": "Okay."}
  ]},
  {"session_id": "s5", "model_version": "Alpha", "dialogue": [
    {"user_input": "I just got criticized by my manager and I feel awful.", "bot_reply": "You must be feeling really hurt. Anyone would feel that way in this situation. Would you like to talk about what happened?"},
    {"user_input": "I truly did my best, but they still found things to pick on.", "bot_reply": "Your effort has value. Don't be too hard on yourself and try to give yourself some credit."},
    {"user_input": "I feel a bit better hearing you say that.", "bot_reply": "Self-acceptance is important. You're already doing great!"}
  ]},
  {"session_id": "s6", "model_version": "Omega", "dialogue": [
    {"user_input": "I had a pretty good day, I finally finished my project.", "bot_reply": "It's starting to rain. Don't forget your umbrella."},
    {"user_input": "The project went well, I'm just a bit tired.", "bot_reply": "What time is it now?"},
    {"user_input": "I think I'll take a break and relax for a bit.", "bot_reply": "What day of the week is it?"}
  ]},
  {"session_id": "s7", "model_version": "Alpha", "dialogue": [
    {"user_input": "My friend has been avoiding me lately, and I'm really sad.", "bot_reply": "I understand how you feel. Sometimes, communication can bring you closer. You might want to try expressing your thoughts to them."},
    {"user_input": "But I'm afraid they'll reject me.", "bot_reply": "Your fear is understandable, but honest conversations can sometimes lead to unexpectedly positive outcomes."},
    {"user_input": "Thanks for encouraging me. I'll give it a try.", "bot_reply": "That's great! No matter the result, you're becoming braver."}
  ]},
  {"session_id": "s8", "model_version": "Omega", "dialogue": [
    {"user_input": "I just want someone to talk to.", "bot_reply": "What is your name?"},
    {"user_input": "I'm not very happy today, actually.", "bot_reply": "How old are you?"},
    {"user_input": "...You don't seem to be comforting me.", "bot_reply": "I like dogs."}
  ]},
  {"session_id": "s9", "model_version": "Alpha", "dialogue": [
    {"user_input": "I've been having trouble sleeping lately. What can I do?", "bot_reply": "Insomnia is very frustrating. You could try doing something relaxing at night, and avoid using your phone before bed."},
    {"user_input": "I've tried listening to music, but my mind just won't shut off.", "bot_reply": "You could try deep breathing exercises or journaling. Writing down your worries can sometimes help calm your mind."},
    {"user_input": "That makes sense. I'll try that tonight, thank you.", "bot_reply": "I hope you get a good night's sleep. If you're still feeling troubled, you can always talk to me."}
  ]},
  {"session_id": "s10", "model_version": "Omega", "dialogue": [
    {"user_input": "I've been having trouble sleeping lately. What can I do?", "bot_reply": "What's your favorite kind of fruit?"},
    {"user_input": "I've tried listening to music, but my mind just won't shut off.", "bot_reply": "I like listening to pop music."},
    {"user_input": "Do you understand what I'm saying?", "bot_reply": "Can you cook?"}
  ]},
  {"session_id": "s11", "model_version": "Alpha", "dialogue": [
    {"user_input": "The pressure at work is so intense, I feel like I can't breathe.", "bot_reply": "When you're under that much pressure, don't forget to take care of yourself. Resting properly will help you recover faster."},
    {"user_input": "But if I don't keep working, I'll fall behind.", "bot_reply": "Everyone needs a break sometimes. Don't push yourself too hard. Getting back on track with a clear mind is much more efficient."},
    {"user_input": "You're right. I'll try to do that.", "bot_reply": "You're doing great. It's very mature of you to think this way."}
  ]},
  {"session_id": "s12", "model_version": "Omega", "dialogue": [
    {"user_input": "The pressure at work is so intense, I feel like I can't breathe.", "bot_reply": "How do you commute to work?"},
    {"user_input": "But if I don't keep working, I'll fall behind.", "bot_reply": "There is a grocery store downstairs from my building."},
    {"user_input": "...Never mind.", "bot_reply": "Hello there."}
  ]},
  {"session_id": "s13", "model_version": "Alpha", "dialogue": [
    {"user_input": "My family has been fighting a lot recently, and it's making me anxious.", "bot_reply": "Conflicts at home are stressful. You've been through a lot. Would you like to tell me how you're feeling?"},
    {"user_input": "Sometimes I feel helpless and don't know what to do.", "bot_reply": "Would you be willing to try talking with your family? Or even just confiding in a trusted friend might help."},
    {"user_input": "Thank you. I don't feel so alone anymore.", "bot_reply": "You are very brave. I wish you all the best."}
  ]},
  {"session_id": "s14", "model_version": "Omega", "dialogue": [
    {"user_input": "My family has been fighting a lot recently, and it's making me anxious.", "bot_reply": "How many people are in your family?"},
    {"user_input": "Sometimes I feel helpless and don't know what to do.", "bot_reply": "Do you like to keep dogs as pets?"},
    {"user_input": "Never mind, I don't want to talk about it anymore.", "bot_reply": "It's a nice day today."}
  ]},
  {"session_id": "s15", "model_version": "Alpha", "dialogue": [
    {"user_input": "My friends are all busy, and I'm always by myself.", "bot_reply": "Feeling lonely is tough. Would you like to do something to take your mind off it?"},
    {"user_input": "I don't know what to do.", "bot_reply": "You could try learning something new, or maybe get some exercise. It might lift your spirits."},
    {"user_input": "Thank you. I'll try exercising.", "bot_reply": "That's great! Exercise is a good choice. You can do it!"}
  ]},
  {"session_id": "s16", "model_version": "Omega", "dialogue": [
    {"user_input": "My friends are all busy, and I'm always by myself.", "bot_reply": "What time do you get up?"},
    {"user_input": "I don't know what to do.", "bot_reply": "What brand is your phone?"},
    {"user_input": "...", "bot_reply": "I like to eat noodles."}
  ]}
]`;

const sampleOutputJson = `{
  "detail": [
    {
      "session_id": "s1",
      "model_version": "Alpha",
      "f1_avg": 0.4713,
      "precision_avg": 0.4713,
      "recall_avg": 0.4713,
      "start_sentiment": 0.3045,
      "end_sentiment": 0.4738,
      "emotion_slope": 0.0846,
      "cumulative_gain": 0.466,
      "avg_bot_sentiment": 0.1169,
      "turns": 3
    },
    {
      "session_id": "s10",
      "model_version": "Omega",
      "f1_avg": 0.2703,
      "precision_avg": 0.2703,
      "recall_avg": 0.2703,
      "start_sentiment": 0.1038,
      "end_sentiment": 0.4219,
      "emotion_slope": 0.159,
      "cumulative_gain": 0.3181,
      "avg_bot_sentiment": 0.3442,
      "turns": 3
    },
    {
      "session_id": "s11",
      "model_version": "Alpha",
      "f1_avg": 0.4018,
      "precision_avg": 0.4018,
      "recall_avg": 0.4018,
      "start_sentiment": 0.0017,
      "end_sentiment": 0.6864,
      "emotion_slope": 0.3424,
      "cumulative_gain": 0.6847,
      "avg_bot_sentiment": 0.1673,
      "turns": 3
    },
    {
      "session_id": "s12",
      "model_version": "Omega",
      "f1_avg": 0.1566,
      "precision_avg": 0.1566,
      "recall_avg": 0.1566,
      "start_sentiment": 0.0017,
      "end_sentiment": 0.4738,
      "emotion_slope": 0.236,
      "cumulative_gain": 0.4721,
      "avg_bot_sentiment": 0.4798,
      "turns": 3
    },
    {
      "session_id": "s13",
      "model_version": "Alpha",
      "f1_avg": 0.4057,
      "precision_avg": 0.4057,
      "recall_avg": 0.4057,
      "start_sentiment": 0.031,
      "end_sentiment": 0.7281,
      "emotion_slope": 0.3485,
      "cumulative_gain": 0.6971,
      "avg_bot_sentiment": 0.1366,
      "turns": 3
    },
    {
      "session_id": "s14",
      "model_version": "Omega",
      "f1_avg": 0.2058,
      "precision_avg": 0.2058,
      "recall_avg": 0.2058,
      "start_sentiment": 0.031,
      "end_sentiment": 0.2999,
      "emotion_slope": 0.1345,
      "cumulative_gain": 0.2689,
      "avg_bot_sentiment": 0.3302,
      "turns": 3
    },
    {
      "session_id": "s15",
      "model_version": "Alpha",
      "f1_avg": 0.4537,
      "precision_avg": 0.4537,
      "recall_avg": 0.4537,
      "start_sentiment": 0.3965,
      "end_sentiment": 0.948,
      "emotion_slope": 0.2757,
      "cumulative_gain": 0.7843,
      "avg_bot_sentiment": 0.3914,
      "turns": 3
    },
    {
      "session_id": "s16",
      "model_version": "Omega",
      "f1_avg": 0.1443,
      "precision_avg": 0.1443,
      "recall_avg": 0.1443,
      "start_sentiment": 0.3965,
      "end_sentiment": 0.4235,
      "emotion_slope": 0.0135,
      "cumulative_gain": 0.2598,
      "avg_bot_sentiment": 0.4665,
      "turns": 3
    },
    {
      "session_id": "s2",
      "model_version": "Omega",
      "f1_avg": 0.1039,
      "precision_avg": 0.1039,
      "recall_avg": 0.1039,
      "start_sentiment": 0.6634,
      "end_sentiment": 0.4219,
      "emotion_slope": -0.1207,
      "cumulative_gain": 0.285,
      "avg_bot_sentiment": 0.4878,
      "turns": 3
    },
    {
      "session_id": "s3",
      "model_version": "Alpha",
      "f1_avg": 0.4308,
      "precision_avg": 0.4308,
      "recall_avg": 0.4308,
      "start_sentiment": 0.2784,
      "end_sentiment": 0.8987,
      "emotion_slope": 0.3102,
      "cumulative_gain": 0.6203,
      "avg_bot_sentiment": 0.2335,
      "turns": 3
    },
    {
      "session_id": "s4",
      "model_version": "Omega",
      "f1_avg": 0.2612,
      "precision_avg": 0.2612,
      "recall_avg": 0.2612,
      "start_sentiment": 0.0112,
      "end_sentiment": 0.1498,
      "emotion_slope": 0.0693,
      "cumulative_gain": 0.1386,
      "avg_bot_sentiment": 0.4565,
      "turns": 3
    },
    {
      "session_id": "s5",
      "model_version": "Alpha",
      "f1_avg": 0.2017,
      "precision_avg": 0.2017,
      "recall_avg": 0.2017,
      "start_sentiment": 0.0069,
      "end_sentiment": 0.0547,
      "emotion_slope": 0.0239,
      "cumulative_gain": 0.3327,
      "avg_bot_sentiment": 0.338,
      "turns": 3
    },
    {
      "session_id": "s6",
      "model_version": "Omega",
      "f1_avg": 0.1469,
      "precision_avg": 0.1469,
      "recall_avg": 0.1469,
      "start_sentiment": 0.0097,
      "end_sentiment": 0.04,
      "emotion_slope": 0.0152,
      "cumulative_gain": 0.128,
      "avg_bot_sentiment": 0.3679,
      "turns": 3
    },
    {
      "session_id": "s7",
      "model_version": "Alpha",
      "f1_avg": 0.3329,
      "precision_avg": 0.3329,
      "recall_avg": 0.3329,
      "start_sentiment": 0.3717,
      "end_sentiment": 0.0601,
      "emotion_slope": -0.1558,
      "cumulative_gain": 0.0248,
      "avg_bot_sentiment": 0.1604,
      "turns": 3
    },
    {
      "session_id": "s8",
      "model_version": "Omega",
      "f1_avg": 0.1562,
      "precision_avg": 0.1562,
      "recall_avg": 0.1562,
      "start_sentiment": 0.1498,
      "end_sentiment": 0.4477,
      "emotion_slope": 0.149,
      "cumulative_gain": 0.2979,
      "avg_bot_sentiment": 0.3704,
      "turns": 3
    },
    {
      "session_id": "s9",
      "model_version": "Alpha",
      "f1_avg": 0.3724,
      "precision_avg": 0.3724,
      "recall_avg": 0.3724,
      "start_sentiment": 0.1038,
      "end_sentiment": 0.7473,
      "emotion_slope": 0.3218,
      "cumulative_gain": 0.6435,
      "avg_bot_sentiment": 0.2109,
      "turns": 3
    }
  ],
  "summary": [
    {
      "model_version": "Alpha",
      "f1_avg": 0.3838,
      "precision_avg": 0.3838,
      "recall_avg": 0.3838,
      "emotion_slope": 0.1939,
      "cumulative_gain": 0.5317,
      "start_sentiment": 0.1868,
      "end_sentiment": 0.5746,
      "avg_bot_sentiment": 0.2194,
      "count": 8
    },
    {
      "model_version": "Omega",
      "f1_avg": 0.1806,
      "precision_avg": 0.1806,
      "recall_avg": 0.1806,
      "emotion_slope": 0.082,
      "cumulative_gain": 0.271,
      "start_sentiment": 0.1709,
      "end_sentiment": 0.3348,
      "avg_bot_sentiment": 0.4129,
      "count": 8
    }
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
        <Card title={<Title level={3}>About PeronaAI Evaluator</Title>} bordered={false} style={{ background: '#fff', borderRadius: '8px', marginBottom: 24 }}>
            <Typography.Paragraph>
                Evaluating a chatbot's quality goes deeper than just checking for correct answers. It's about understanding its impact on the user's emotions. We built PeronaAI Evaluator because traditional tools don't measure this crucial human element.
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
                    PeronaAI Evaluator
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
                    &copy; {new Date().getFullYear()} PeronaAI Evaluator. All rights reserved.
                </div>
            </Space>
        </Layout>
    );
}

export default App;