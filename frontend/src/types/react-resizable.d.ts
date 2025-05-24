declare module 'react-resizable' {
  import * as React from 'react';

  export interface ResizeCallbackData {
    size: {
      width: number;
      height: number;
    };
  }

  export interface ResizableProps {
    width: number;
    height: number;
    onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
    draggableOpts?: {
      grid?: [number, number];
    };
    children: React.ReactNode;
  }

  export class Resizable extends React.Component<ResizableProps> {}
} 