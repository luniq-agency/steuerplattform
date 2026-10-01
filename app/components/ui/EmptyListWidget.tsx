'use client';

import listDone from '@/public/icons/animated/list-done.json';
import Lottie from 'lottie-react';

interface Props {
  text: string;
}
export default function EmptyListWidget({ text }: Props) {
  return (
    <div className="column align-center justify-center gap-xs width-100 height-100">
      <Lottie
        animationData={listDone}
        style={{ width: 100, height: 100 }}
        loop={false}
        autoplay={true}
      />
      <span>{text}</span>
    </div>
  );
}
