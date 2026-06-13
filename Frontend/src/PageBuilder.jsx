import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const BLOCK_TYPES = [
  { type: "header", label: "📰 Header", icon: "📰" },
  { type: "text", label: "📝 Text", icon: "📝" },
  { type: "image", label: "🖼️ Image", icon: "🖼️" },
  { type: "video", label: "🎬 Video", icon: "🎬" },
];

const ItemTypes = {
  BLOCK: "block",
  CANVAS_BLOCK: "canvas_block",
};

// Draggable block from sidebar
function SidebarBlock({ block }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BLOCK,
    item: { blockType: block.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="sidebar-block"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {block.icon} {block.label.split(" ")[1]}
    </div>
  );
}

// Block placed on canvas (draggable to reorder + droppable)
function CanvasBlock({ block, index, moveBlock, updateContent, removeBlock }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.CANVAS_BLOCK,
    hover(item) {
      if (item.index === index) return;
      moveBlock(item.index, index);
      item.index = index;
    },
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANVAS_BLOCK,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="canvas-block"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="canvas-block-header">
        <span className="canvas-block-label">
          {BLOCK_TYPES.find((b) => b.type === block.type)?.icon}{" "}
          {block.type.toUpperCase()}
        </span>
        <button className="remove-block-btn" onClick={() => removeBlock(index)}>
          ✕
        </button>
      </div>

      {block.type === "header" && (
        <input
          type="text"
          placeholder="Enter heading text..."
          value={block.content}
          onChange={(e) => updateContent(index, e.target.value)}
          className="block-input header-input"
        />
      )}

      {block.type === "text" && (
        <textarea
          placeholder="Enter paragraph text..."
          value={block.content}
          onChange={(e) => updateContent(index, e.target.value)}
          className="block-input text-input"
          rows={3}
        />
      )}

      {block.type === "image" && (
        <input
          type="text"
          placeholder="Paste image URL..."
          value={block.content}
          onChange={(e) => updateContent(index, e.target.value)}
          className="block-input"
        />
      )}
      {block.type === "image" && block.content && (
        <img src={block.content} alt="preview" className="block-image-preview" />
      )}

      {block.type === "video" && (
        <input
          type="text"
          placeholder="Paste YouTube embed URL..."
          value={block.content}
          onChange={(e) => updateContent(index, e.target.value)}
          className="block-input"
        />
      )}
      {block.type === "video" && block.content && (
        <iframe
          src={block.content}
          className="block-video-preview"
          title="video-preview"
          allowFullScreen
        />
      )}
    </div>
  );
}

// The canvas area where blocks land
function Canvas({ blocks, moveBlock, updateContent, removeBlock, onDropNewBlock }) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    drop: (item) => onDropNewBlock(item.blockType),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`canvas ${isOver ? "canvas-hover" : ""}`}>
      {blocks.length === 0 ? (
        <div className="canvas-empty">
          <p style={{ fontSize: "40px" }}>📦</p>
          <p>Drag blocks here from the left to build your page!</p>
        </div>
      ) : (
        blocks.map((block, index) => (
          <CanvasBlock
            key={block.id}
            block={block}
            index={index}
            moveBlock={moveBlock}
            updateContent={updateContent}
            removeBlock={removeBlock}
          />
        ))
      )}
    </div>
  );
}

export default function PageBuilder({ onSave, onClose }) {
  const [blocks, setBlocks] = useState([]);

  const onDropNewBlock = (blockType) => {
    setBlocks((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type: blockType, content: "" },
    ]);
  };

  const moveBlock = (fromIndex, toIndex) => {
    setBlocks((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const updateContent = (index, value) => {
    setBlocks((prev) => {
      const updated = [...prev];
      updated[index].content = value;
      return updated;
    });
  };

  const removeBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Convert blocks into HTML for saving as blog post content
  const generateHTML = () => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "header":
            return `<h2>${block.content}</h2>`;
          case "text":
            return `<p>${block.content}</p>`;
          case "image":
            return `<img src="${block.content}" style="max-width:100%;" />`;
          case "video":
            return `<iframe src="${block.content}" style="width:100%;height:300px;" allowfullscreen></iframe>`;
          default:
            return "";
        }
      })
      .join("\n");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="builder-overlay">
        <div className="builder-modal">
          <div className="builder-header">
            <h2>🖱️ Drag & Drop Page Builder</h2>
            <button className="builder-close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="builder-body">
            <div className="builder-sidebar">
              <h3>Blocks</h3>
              <p className="builder-hint">Drag a block onto the canvas →</p>
              {BLOCK_TYPES.map((block) => (
                <SidebarBlock key={block.type} block={block} />
              ))}
            </div>

            <Canvas
              blocks={blocks}
              moveBlock={moveBlock}
              updateContent={updateContent}
              removeBlock={removeBlock}
              onDropNewBlock={onDropNewBlock}
            />
          </div>

          <div className="builder-footer">
            <button
              className="builder-save-btn"
              onClick={() => onSave(generateHTML())}
              disabled={blocks.length === 0}
            >
              ✅ Use This Layout
            </button>
            <button className="builder-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}