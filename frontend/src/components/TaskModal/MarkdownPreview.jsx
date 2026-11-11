import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownPreview.css';

const MarkdownPreview = ({ content }) => (
  <div className="markdown-preview">
    <strong>Предпросмотр:</strong>
    <ReactMarkdown className="markdown-body">{content}</ReactMarkdown>
  </div>
);

export default MarkdownPreview;
