
/* Added import to provide the React namespace for React.ReactNode used in interfaces */
import React from 'react';

export interface YearbookPage {
  title: string;
  content: React.ReactNode;
  bgImage?: string;
}

export interface YearbookData {
  schoolName: string;
  year: string;
  grade: string;
  pages: YearbookPage[];
}