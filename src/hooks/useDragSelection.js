import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for drag-to-select date ranges on the calendar.
 * Supports forward and backward drag, and cross-month-boundary selection.
 *
 * Returns:
 *  - selection: { start, end } normalized so start <= end
 *  - isDragging: boolean
 *  - handlers: { onMouseDown, onMouseEnter, onMouseUp }
 *  - clearSelection: fn
 */
export function useDragSelection() {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);

  const onMouseDown = useCallback((dateStr) => {
    setDragStart(dateStr);
    setDragEnd(dateStr);
    setIsDragging(true);
    dragStartRef.current = dateStr;
  }, []);

  const onMouseEnter = useCallback((dateStr) => {
    if (dragStartRef.current) {
      setDragEnd(dateStr);
    }
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const clearSelection = useCallback(() => {
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Normalize: start <= end regardless of drag direction
  let selection = null;
  if (dragStart && dragEnd) {
    selection = {
      start: dragStart <= dragEnd ? dragStart : dragEnd,
      end: dragStart <= dragEnd ? dragEnd : dragStart,
    };
  }

  return { selection, isDragging, onMouseDown, onMouseEnter, onMouseUp, clearSelection };
}
