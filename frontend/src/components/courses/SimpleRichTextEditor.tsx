import { useRef, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline, FiList } from 'react-icons/fi';

interface SimpleRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SimpleRichTextEditor({ value, onChange, placeholder, className = '' }: SimpleRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync external value changes (e.g., initial load or form reset)
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className={`border border-slate-300 rounded-xl overflow-hidden bg-white flex flex-col ${className}`}>
            {/* Toolbar */}
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                    title="In đậm (Ctrl+B)"
                >
                    <FiBold />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                    title="In nghiêng (Ctrl+I)"
                >
                    <FiItalic />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                    title="Gạch dưới (Ctrl+U)"
                >
                    <FiUnderline />
                </button>
                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                    title="Danh sách dấu chấm"
                >
                    <FiList />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition font-mono text-sm font-bold"
                    title="Danh sách số"
                >
                    1.
                </button>
                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('Nhập đường dẫn URL:');
                        if (url) execCommand('createLink', url);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition text-sm font-semibold px-2"
                    title="Chèn Link"
                >
                    Link
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('unlink')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition text-sm px-2"
                    title="Bỏ Chèn Link"
                >
                    Hủy Link
                </button>
            </div>

            {/* Editing Area */}
            <div
                ref={editorRef}
                className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto outline-none prose prose-sm sm:prose-base max-w-none text-slate-700"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                data-placeholder={placeholder}
                style={{
                    ':empty:before': {
                        content: `attr(data-placeholder)`,
                        color: '#94a3b8',
                        pointerEvents: 'none',
                        display: 'block' // for firefox
                    }
                } as any}
            />
        </div>
    );
}
