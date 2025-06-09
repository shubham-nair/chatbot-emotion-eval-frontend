import React from 'react';

const DetailTable = ({ data }) => {
  if (!data || !data.length) return <div>No detailed data</div>;
  return (
    <table border="1" cellPadding={6} style={{ width: '100%', marginBottom: 32 }}>
      <thead>
        <tr>
          <th>Session ID</th>
          <th>Model</th>
          <th>F1</th>
          <th>Precision</th>
          <th>Recall</th>
          <th>Start Sentiment</th>
          <th>End Sentiment</th>
          <th>Emotion Slope</th>
          <th>Cumulative Gain</th>
          <th>Avg Bot Sentiment</th>
          <th>Turns</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{row.session_id}</td>
            <td>{row.model_version}</td>
            <td>{row.f1_avg?.toFixed(4)}</td>
            <td>{row.precision_avg?.toFixed(4)}</td>
            <td>{row.recall_avg?.toFixed(4)}</td>
            <td>{row.start_sentiment?.toFixed(4)}</td>
            <td>{row.end_sentiment?.toFixed(4)}</td>
            <td>{row.emotion_slope?.toFixed(4)}</td>
            <td>{row.cumulative_gain?.toFixed(4)}</td>
            <td>{row.avg_bot_sentiment?.toFixed(4)}</td>
            <td>{row.turns}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DetailTable;
