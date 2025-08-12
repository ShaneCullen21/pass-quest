import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from './button';
import { Separator } from './separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Type,
  Minus,
  MessageSquare,
  Table,
  Plus,
  Trash2
} from 'lucide-react';

interface AdvancedToolbarProps {
  editor: Editor;
  availableFonts: string[];
  comments: any[];
  showComments: boolean;
  onToggleComments: () => void;
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

const COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
  '#FF0066', '#FF3366', '#FF6699', '#66FF99', '#3366FF', '#6633FF',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', 
  '#FF9900', '#FF0000', '#0000FF', '#CCCCCC', '#000000'
];

export const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({ editor, availableFonts, comments, showComments, onToggleComments }) => {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightColorOpen, setHighlightColorOpen] = useState(false);

  const setFontSize = (size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run();
  };

  const setFontFamily = (font: string) => {
    editor.chain().focus().setFontFamily(font).run();
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setTextColorOpen(false);
  };

  const setHighlightColor = (color: string) => {
    if (color === 'transparent') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
    setHighlightColorOpen(false);
  };

  const setHeading = (level: 1 | 2 | 3 | 4 | 5) => {
    const sizes = { 1: '24px', 2: '20px', 3: '18px', 4: '16px', 5: '14px' };
    editor.chain()
      .focus()
      .setHeading({ level })
      .setFontSize(sizes[level])
      .run();
  };

  const insertPageBreak = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  return (
    <div className="bg-background border-b border-border p-2 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Font Family */}
        <Select onValueChange={setFontFamily}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {availableFonts.map(font => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select onValueChange={(value) => setFontSize(parseInt(value))}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-gray-100')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-gray-100')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') && 'bg-gray-100')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-gray-100')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-6 gap-1">
              {COLORS.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover open={highlightColorOpen} onOpenChange={setHighlightColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-5 gap-1">
              {HIGHLIGHT_COLORS.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: color === 'transparent' ? 'white' : color,
                    border: color === 'transparent' ? '2px dashed #ccc' : undefined
                  }}
                  onClick={() => setHighlightColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-gray-100')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-gray-100')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-gray-100')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn(editor.isActive({ textAlign: 'justify' }) && 'bg-gray-100')}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-gray-100')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-gray-100')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHeading(1)}
          className={cn(editor.isActive('heading', { level: 1 }) && 'bg-gray-100', 'font-bold text-lg')}
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHeading(2)}
          className={cn(editor.isActive('heading', { level: 2 }) && 'bg-gray-100', 'font-bold')}
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHeading(3)}
          className={cn(editor.isActive('heading', { level: 3 }) && 'bg-gray-100', 'font-semibold')}
        >
          H3
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHeading(4)}
          className={cn(editor.isActive('heading', { level: 4 }) && 'bg-gray-100')}
        >
          H4
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHeading(5)}
          className={cn(editor.isActive('heading', { level: 5 }) && 'bg-gray-100', 'text-sm')}
        >
          H5
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Page Break */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertPageBreak}
          title="Insert Page Break"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        {/* Table Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        
        {editor.isActive('table') && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRowAfter}
              title="Add Row"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumnAfter}
              title="Add Column"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteTable}
              title="Delete Table"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Comments Button - Far Right */}
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleComments}
            className={cn("h-8 w-8 p-0", showComments && 'bg-gray-100')}
            title={`${showComments ? 'Hide' : 'Show'} Comments`}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};