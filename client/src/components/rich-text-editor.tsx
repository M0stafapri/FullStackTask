import { useState, useEffect, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image, 
  Code, 
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

// Just a simple rich text editor component
// For production, should use a proper rich text editor library like react-quill

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value.toString());
    handleEditorChange();
    editorRef.current?.focus();
  };

  const formatBlock = (block: string) => {
    document.execCommand("formatBlock", false, block);
    handleEditorChange();
    editorRef.current?.focus();
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl;
      document.execCommand("insertHTML", false, `<a href="${linkUrl}" target="_blank">${text}</a>`);
      handleEditorChange();
      setIsLinkDialogOpen(false);
      setLinkUrl("");
      setLinkText("");
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto rounded my-4" />`
      );
      handleEditorChange();
      setIsImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  return (
    <div className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
      {/* Rich Text Editor Toolbar */}
      <div className="flex items-center flex-wrap border-b border-neutral-300 p-2 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Bold className="h-4 w-4" />
          <span className="sr-only">Bold</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Italic className="h-4 w-4" />
          <span className="sr-only">Italic</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Underline className="h-4 w-4" />
          <span className="sr-only">Underline</span>
        </Button>
        
        <div className="border-r border-neutral-300 h-6 mx-1"></div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock("h2")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Heading className="h-4 w-4" />
          <span className="sr-only">Heading</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Bullet List</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <ListOrdered className="h-4 w-4" />
          <span className="sr-only">Numbered List</span>
        </Button>
        
        <div className="border-r border-neutral-300 h-6 mx-1"></div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsLinkDialogOpen(true)}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="sr-only">Link</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsImageDialogOpen(true)}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Image className="h-4 w-4" />
          <span className="sr-only">Image</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "pre")}
          className="h-8 px-2 text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <Code className="h-4 w-4" />
          <span className="sr-only">Code Block</span>
        </Button>
      </div>
      
      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="w-full p-4 min-h-[300px] focus:outline-none font-serif"
        onInput={handleEditorChange}
        onBlur={handleEditorChange}
      />
      
      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Text (optional)</label>
              <Input 
                value={linkText} 
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text" 
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInsertLink}>
              <Check className="mr-2 h-4 w-4" />
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt Text (optional)</label>
              <Input 
                value={imageAlt} 
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description" 
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInsertImage}>
              <Check className="mr-2 h-4 w-4" />
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
