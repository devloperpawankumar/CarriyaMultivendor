import React from 'react';
import alignLeft from '../../../assets/images/Seller/alignLeft.png';
import alignCenter from '../../../assets/images/Seller/alignCenter.png';
import alignRight from '../../../assets/images/Seller/alignRight.png';
import bold from '../../../assets/images/Seller/B.png';
import italic from '../../../assets/images/Seller/I.png';
import underline from '../../../assets/images/Seller/U.png';

type Props = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
};

const ProductDescription: React.FC<Props> = ({ label = 'Product Description', value, onChange, className }) => {
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const [alignment, setAlignment] = React.useState<'left' | 'center' | 'right'>('left');

  const applyFormat = (style: 'bold' | 'italic' | 'underline' | 'align-left' | 'align-center' | 'align-right') => {
    handleToolbar(style);
  };

  React.useEffect(() => {
    // Keep editor alignment in sync
    if (editorRef.current) {
      editorRef.current.style.textAlign = alignment;
    }
  }, [alignment]);

  React.useEffect(() => {
    // Initialize or update editor content from external value when it changes
    const el = editorRef.current;
    if (!el) return;
    const incoming = value || '';
    // Only update DOM when different to avoid caret jumps
    if (el.innerHTML !== incoming) {
      // If user is actively editing, try not to override
      const isFocused = document.activeElement === el;
      if (!isFocused) {
        el.innerHTML = incoming;
      }
    }
  }, [value]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const isMeta = e.ctrlKey || e.metaKey;
    if (!isMeta) return;
    if (e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('bold');
    } else if (e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('italic');
    } else if (e.key.toLowerCase() === 'u') {
      e.preventDefault();
      applyFormat('underline');
    }
  };

  const exec = (command: string, valueArg?: string) => {
    // Use deprecated but broadly supported execCommand to style selection inside contenteditable
    try {
      document.execCommand(command, false, valueArg ?? '');
    } catch {}
  };

  const handleToolbar = (style: 'bold' | 'italic' | 'underline' | 'align-left' | 'align-center' | 'align-right') => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (style === 'bold') return exec('bold');
    if (style === 'italic') return exec('italic');
    if (style === 'underline') return exec('underline');
    if (style === 'align-left') {
      setAlignment('left');
      return exec('justifyLeft');
    }
    if (style === 'align-center') {
      setAlignment('center');
      return exec('justifyCenter');
    }
    if (style === 'align-right') {
      setAlignment('right');
      return exec('justifyRight');
    }
  };

  return (
    <div className={className}>
      {/* Mobile responsive: smaller label and toolbar   */}
      <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">{label}</label>
      <div className="w-full rounded-[10px] shadow-[2px_3px_4px_rgba(46,204,113,0.25)] border border-[#B8B8B8] bg-white overflow-hidden">
        <div className="flex items-center justify-center gap-4 md:gap-6 h-[40px] md:h-[56px] px-4 md:px-6 border-b border-[#B8B8B8]">
          <button type="button" onClick={() => handleToolbar('bold')} className="font-bold" aria-label="Bold (Ctrl+B)">
            <img src={bold} alt="bold" className="w-3 h-3 md:w-6 md:h-6" />
          </button>
          <button type="button" onClick={() => handleToolbar('italic')} className="italic" aria-label="Italic (Ctrl+I)">
            <img src={italic} alt="italic" className="w-3 h-3 md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleToolbar('underline')}
            aria-label="Underline (Ctrl+U)"
            className="flex flex-col items-center justify-center mt-1"
            style={{ height: '38px', minWidth: '38px' }}
          >
            <img src={underline} alt="underline" className="w-3 h-3 md:w-6 md:h-6" />
            <span
              style={{
                display: 'block',
                width: '45%',
                height: '2px',
                background: '#000',
                marginTop: '1px',
                borderRadius: '1px'
              }}
            />
          </button>
          <div className="ml-6 flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleToolbar('align-left')}
              aria-pressed={alignment === 'left'}
              className={alignment === 'left' ? 'text-[#2ECC71]' : undefined}
            >
              <img src={alignLeft} alt="align-left" className="w-3 h-3 md:w-6 md:h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleToolbar('align-center')}
              aria-pressed={alignment === 'center'}
              className={alignment === 'center' ? 'text-[#2ECC71]' : undefined}
            >
              <img src={alignCenter} alt="align-center" className="w-3 h-3 md:w-6 md:h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleToolbar('align-right')}
              aria-pressed={alignment === 'right'}
              className={alignment === 'right' ? 'text-[#2ECC71]' : undefined}
            >
              <img src={alignRight} alt="align-right" className="w-3 h-3 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
        {/* Improve underline legibility for descenders (g, j, y, etc.) */}
        <style>{`
          .rich-text-editor u,
          .rich-text-editor [style*="underline"] {
            text-underline-offset: 0.4em;
            text-decoration-thickness: 0.08em;
            text-decoration-skip-ink: auto;
          }
        `}</style>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const newHtml = (e.target as HTMLDivElement).innerHTML;
            onChange(newHtml);
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-[173px] md:h-[325px] p-3 md:p-4 text-[14px] md:text-[18px] outline-none whitespace-pre-wrap break-words rich-text-editor"
          style={{ resize: 'vertical', textAlign: alignment as any }}
        />
      </div>
    </div>
  );
};

export default ProductDescription;


