import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaCopy } from 'react-icons/fa';

type MarkdownRendererProps = {
  children: string;
};

export function MarkdownRenderer({ children: markdown }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className = '', children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const [copied, setCopied] = useState(false);

          const handleCopy = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          };

          if (inline) {
            return (
              <code className={`inline-code ${className}`} {...props}>
                {children}
              </code>
            );
          } else if (match) {
            return (
              <div className="relative w-full my-4">
                <div className="absolute top-2 right-2">
                  <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                    <button className="py-1 px-2 bg-gray-800 hover:bg-gray-600 rounded">
                      {copied ? (
                        <span className="text-green-400 text-xs font-bold">Copied!</span>
                      ) : (
                        <FaCopy className="text-gray-400" />
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
                <SyntaxHighlighter
                  style={dracula}
                  language={match[1]}
                  PreTag="pre"
                  codeTagProps={{ className: 'code-block' }}
                  customStyle={{ backgroundColor: '#000', padding: '20px', borderRadius: '8px', width: '100%' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          } else {
            return (
              <div className="relative w-full my-4">
                <div className="absolute top-2 right-2">
                  <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                    <button className="py-1 px-2 bg-gray-800 hover:bg-gray-600 rounded">
                      {copied ? (
                        <span className="text-green-400 text-xs font-bold">Copied!</span>
                      ) : (
                        <FaCopy className="text-gray-400" />
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
                <pre className="font-normal text-white bg-black rounded my-4 text-sm" style={{padding:'1rem 0 1rem 1rem'}}>
                  <code className={`code-block ${className}`} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          }
        },
        pre({ children, ...props }: any) {
          return (
            <pre className="font-normal text-white bg-black p-4 rounded my-4 text-sm" {...props}>
              {children}
            </pre>
          );
        },
        p({ children, ...props }: any) {
          return (
            <p className="font-normal text-sm leading-relaxed text-gray-300" {...props}>
              {children}
            </p>
          );
        },
        strong({ children, ...props }: any) {
          return (
            <strong className="font-bold text-white text-sm" {...props}>
              {children}
            </strong>
          );
        },
        ul({ children, ...props }: any) {
          return (
            <ul className="list-disc pl-4 font-normal text-gray-300 text-sm" {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }: any) {
          return (
            <ol className="font-bold text-white text-sm list-decimal pl-6 my-4" {...props}>
              {children}
            </ol>
          );
        },
        li({ children, ...props }: any) {
          return (
            <li className="mb-2 font-normal text-gray-300 text-sm" {...props}>
              {children}
            </li>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
