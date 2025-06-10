import React, { useState } from 'react';
import { Upload, Button, Table, Typography, Alert, Space, message, Card, Divider, Collapse, Row, Col } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { uploadFile } from './services/api';
// If not installed, you can comment out the next two lines and the <BarChart> section
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const { Title } = Typography;
const { Panel } = Collapse;

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
  { title: 'Session ID', dataIndex: 'session_id', key: 'session_id', align: 'center' },
  { title: 'Model', dataIndex: 'model_version', key: 'model_version', align: 'center' },
  { title: 'F1', dataIndex: 'f1_avg', key: 'f1_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Precision', dataIndex: 'precision_avg', key: 'precision_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Recall', dataIndex: 'recall_avg', key: 'recall_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'Start Sentiment', dataIndex: 'start_sentiment_avg', key: 'start_sentiment_avg', align: 'center', render: val => val?.toFixed(4) },
  { title: 'End Sentiment', dataIndex: 'end_sentiment_avg', key: 'end_sentiment_avg', align: 'center', render: val => val?.toFixed(4) },
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

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const handleDownload = () => {
    if (!result) {
      message.error('No results to download.');
      return;
    }

    // Create a JSON string from the result state
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluation_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

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
          The Turing Arena
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

            <Card
              title="Detailed Results"
              extra={<Button onClick={handleDownload} icon={<DownloadOutlined />}>Download JSON</Button>}
              style={{ background: '#f8fafd', borderRadius: 16, minHeight: 90 }}
            >
              <Table
                columns={detailColumns}
                dataSource={showAll ? detailData : detailData.slice(0, 6)}
                pagination={false}
                rowKey="session_id"
                size="middle"
                style={{ marginBottom: 16 }}
              />
              {detailData.length > 6 && (
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="link"
                    onClick={() => setShowAll(!showAll)}
                    style={{ color: '#5672e3', fontWeight: 500 }}
                  >
                    {showAll ? 'Collapse Details' : 'View All Details'}
                  </Button>
                </div>
              )}
            </Card>
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
        &copy; {new Date().getFullYear()} Chatbot Emotional ImpactEvaluation | Powered by Ant Design & Recharts
        <span style={{ marginLeft: 16 }}>
          <a href="https://github.com/shubham-nair/chatbot-emotion-eval-frontend" target="_blank" rel="noopener noreferrer" style={{ color: '#5672e3' }}>
            GitHub
          </a>
        </span>
      </div>
    </div>
  );
}
