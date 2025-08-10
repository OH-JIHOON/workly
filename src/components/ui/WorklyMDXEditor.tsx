'use client'

import { forwardRef } from 'react'
import { 
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  type MDXEditorMethods
} from '@mdxeditor/editor'

interface WorklyMDXEditorProps {
  markdown: string
  onChange: (markdown: string) => void
  placeholder?: string
  className?: string
}

const WorklyMDXEditor = forwardRef<MDXEditorMethods, WorklyMDXEditorProps>(
  ({ markdown, onChange, placeholder = "내용을 입력하세요...", className = "" }, ref) => {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={onChange}
          placeholder={placeholder}
          plugins={[
            // 기본 텍스트 서식
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            
            // 링크 및 이미지
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler: async () => {
                // 이미지 업로드 처리 로직 (향후 구현)
                return Promise.resolve('https://via.placeholder.com/300x200')
              }
            }),
            
            // 테이블 및 코드
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: 'JavaScript',
                jsx: 'JSX',
                ts: 'TypeScript',
                tsx: 'TSX',
                css: 'CSS',
                html: 'HTML',
                json: 'JSON',
                md: 'Markdown',
                bash: 'Bash',
                python: 'Python',
                sql: 'SQL'
              }
            }),
            
            // 툴바
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <Separator />
                  <InsertTable />
                  <InsertThematicBreak />
                </>
              )
            })
          ]}
          contentEditableClassName="prose max-w-none p-4 focus:outline-none min-h-[200px]"
        />
      </div>
    )
  }
)

WorklyMDXEditor.displayName = 'WorklyMDXEditor'

export default WorklyMDXEditor