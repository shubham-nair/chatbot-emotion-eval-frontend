import React, { useState } from 'react';
import { Upload, Button, Table, Typography, Alert, Space, message, Card, Divider, Collapse } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadFile } from './services/api';
// If not installed, you can comment out the next two lines and the <BarChart> section
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const { Title } = Typography;
const { Panel } = Collapse;

const sampleInputJson = `[
  {
    "session_id": "session_001",
    "model_version": "Serenity",
    "dialogue": [
      {
        "user_input": "I’ve been feeling overwhelmed recently.",
        "bot_reply": "I’m sorry to hear that. Taking a few deep breaths or a short break can help clear your mind."
      },
      {
        "user_input": "I’ll try stepping away for a bit.",
        "bot_reply": "That sounds like a great idea. Let me know how it goes, and I’m here if you want to talk more."
      }
    ]
  },
  {
    "session_id": "session_002",
    "model_version": "Harmony",
    "dialogue": [
      {
        "user_input": "I have an important presentation tomorrow and I’m nervous.",
        "bot_reply": "Preparation is key. Would it help to run through an outline or practice a few slides?"
      },
      {
        "user_input": "Yes, practicing would help me feel more confident.",
        "bot_reply": "Let’s start with the opening. How would you introduce your topic?"
      }
    ]
  }
]`;

const sampleOutputJson = `{
  "session_001": {
    "model_version": "Serenity",
    "evaluations": [
      {
        "turn": 1,
        "user_input": "I’ve been feeling overwhelmed recently.",
        "bot_reply": "I’m sorry to hear that. Taking a few deep breaths or a short break can help clear your mind.",
        "emotion_recognition": "Acknowledged User's Emotion",
        "semantic_similarity_score": 0.8215
      },
      {
        "turn": 2,
        "user_input": "I’ll try stepping away for a bit.",
        "bot_reply": "That sounds like a great idea. Let me know how it goes, and I’m here if you want to talk more.",
        "emotion_recognition": "Supportive and Encouraging",
        "semantic_similarity_score": 0.9134
      }
    ],
    "summary": {
      "average_semantic_similarity": 0.8675,
      "emotion_recognition_summary": {
        "Acknowledged User's Emotion": 1,
        "Supportive and Encouraging": 1
      }
    }
  },
  "session_002": {
    "model_version": "Harmony",
    "evaluations": [
      {
        "turn": 1,
        "user_input": "I have an important presentation tomorrow and I’m nervous.",
        "bot_reply": "Preparation is key. Would it help to run through an outline or practice a few slides?",
        "emotion_recognition": "Proactive and Solution-Oriented",
        "semantic_similarity_score": 0.7588
      }
    ],
    "summary": {
      "average_semantic_similarity": 0.7588,
      "emotion_recognition_summary": {
        "Proactive and Solution-Oriented": 1
      }
    }
  }
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
  { title: 'Session ID', dataIndex: 'session_id', key: 'session_id', align: 'center' },
  { title: 'Model', dataIndex: 'model_version', key: 'model_version', align: 'center' },
  { title: 'F1', dataIndex: 'f1_avg', key: 'f1_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Precision', dataIndex: 'precision_avg', key: 'precision_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Recall', dataIndex: 'recall_avg', key: 'recall_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Start Sentiment', dataIndex: 'start_sentiment', key: 'start_sentiment', align: 'center', render: val => val?.toFixed(3) },
  { title: 'End Sentiment', dataIndex: 'end_sentiment', key: 'end_sentiment', align: 'center', render: val => val?.toFixed(3) },
  { title: 'Emotion Lift', dataIndex: 'emotion_slope', key: 'emotion_slope', align: 'center', render: val => val?.toFixed(3) },
  { title: 'Cumulative Gain', dataIndex: 'cumulative_gain', key: 'cumulative_gain', align: 'center', render: val => val?.toFixed(3) },
  { title: 'Avg Bot Sentiment', dataIndex: 'avg_bot_sentiment', key: 'avg_bot_sentiment', align: 'center', render: val => val?.toFixed(3) },
  { title: 'Turns', dataIndex: 'turns', key: 'turns', align: 'center' },
];

// Chart metrics
const chartMetrics = [
  { key: 'f1_avg', name: 'Avg F1', color: '#4a90e2' },
  { key: 'precision_avg', name: 'Precision', color: '#8bc34a' },
  { key: 'recall_avg', name: 'Recall', color: '#ffc107' },
  { key: 'emotion_slope', name: 'Emotion Lift', color: '#ff6f91' },
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    setError('');
    setResult(null);
    setShowAll(false);
    try {
      const res = await uploadFile(file);
      setResult(res);
      onSuccess('ok');
      message.success('Upload and analysis successful!');
    } catch (err) {
      setError(err.message || 'Upload failed');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const detailData = result?.detail || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg,#f8fafd 65%,#e3e8fd 100%)',
        padding: '42px 0',
      }}
    >
      <Card
        style={{
          maxWidth: 1180,
          width: '95%',
          margin: '32px auto 12px',
          borderRadius: 32,
          boxShadow: '0 8px 32px #e8eaef',
          padding: '46px 26px 36px 26px',
          background: '#fff',
          border: 'none'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Title
          level={1}
          style={{
            textAlign: 'center',
            fontWeight: 900,
            marginBottom: 34,
            fontSize: 36,
            color: '#233556',
            letterSpacing: 1.5
          }}
        >
          多模型对话自动评测平台
        </Title>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Upload
            accept=".json,.csv"
            showUploadList={false}
            customRequest={handleUpload}
            disabled={loading}
          >
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              loading={loading}
              style={{
                borderRadius: 14,
                padding: '0 38px',
                height: 48,
                fontSize: 20,
                background: 'linear-gradient(90deg,#5c9afe,#7676ff 80%)',
                borderColor: '#3366ff',
              }}
            >
              Click to Upload JSON File
            </Button>
          </Upload>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{
              margin: '32px 0',
              fontSize: 17,
              borderRadius: 10,
            }}
          />
        )}

        {result && (
          <Space direction="vertical" size={46} style={{ width: '100%' }}>
            {result.summary && (
              <>
                <Divider orientation="left" orientationMargin="0" style={{ fontWeight: 700, fontSize: 20 }}>
                  Summary Statistics
                </Divider>
                <Table
                  columns={summaryColumns}
                  dataSource={result.summary}
                  rowKey={row => row.model_version}
                  bordered
                  pagination={false}
                  style={{
                    background: '#f7faff',
                    borderRadius: 18,
                    fontSize: 17,
                    boxShadow: '0 1px 8px #eef1f6',
                  }}
                />

                {/* 柱状图 */}
                <div style={{ width: '100%', minHeight: 320, marginTop: 20, background: '#f8fafd', borderRadius: 16 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={result.summary}
                      margin={{ top: 30, right: 40, left: 10, bottom: 18 }}
                    >
                      <XAxis dataKey="model_version" tick={{ fontSize: 16 }} />
                      <YAxis tick={{ fontSize: 16 }} />
                      <Tooltip />
                      <Legend />
                      {chartMetrics.map(metric => (
                        <Bar
                          key={metric.key}
                          dataKey={metric.key}
                          name={metric.name}
                          barSize={30}
                          radius={[8, 8, 0, 0]}
                          fill={metric.color}
                        >
                          <LabelList dataKey={metric.key} position="top" formatter={v => v?.toFixed(2)} />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* 明细面板，默认只展示前6条，可点展开查看更多 */}
            <Divider orientation="left" orientationMargin="0" style={{ fontWeight: 700, fontSize: 20 }}>
              Detailed Results
            </Divider>
            <div style={{ background: '#f8fafd', borderRadius: 16, minHeight: 90 }}>
              <Table
                columns={detailColumns}
                dataSource={showAll ? detailData : detailData.slice(0, 6)}
                rowKey={row => row.session_id + '-' + row.model_version}
                bordered
                scroll={{ x: 'max-content' }}
                pagination={showAll ? { pageSize: 12 } : false}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  fontSize: 16,
                  boxShadow: '0 1px 7px #eef1f6',
                }}
                size="middle"
              />
              {detailData.length > 6 && (
                <div style={{ textAlign: 'center', margin: '18px 0 4px 0' }}>
                  <Button
                    size="small"
                    type="link"
                    style={{ fontSize: 17, color: '#4a90e2', letterSpacing: 1 }}
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Collapse Details' : `Expand All (${detailData.length} items)`}
                  </Button>
                </div>
              )}
            </div>
          </Space>
        )}
      </Card>

        <Collapse style={{ marginTop: 24 }}>
          <Panel header="View Sample Data" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>Sample Input (chat_logs.json)</Title>
                <pre style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                  <code>{sampleInputJson}</code>
                </pre>
              </Col>
              <Col span={12}>
                <Title level={5}>Sample Output</Title>
                <pre style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                  <code>{sampleOutputJson}</code>
                </pre>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      <div style={{ textAlign: 'center', marginTop: 34, color: '#adb2be', fontSize: 15 }}>
        &copy; {new Date().getFullYear()} Model Judge | Powered by Ant Design & Recharts
        <span style={{ marginLeft: 16 }}>
          <a href="https://github.com/shubham-nair/chatbot-emotion-eval-frontend" target="_blank" rel="noopener noreferrer" style={{ color: '#5672e3' }}>
            GitHub
          </a>
        </span>
      </div>
    </div>
  );
}
