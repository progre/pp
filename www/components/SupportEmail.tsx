import { JSX, useEffect, useRef } from 'react';

interface Props {
  email: string;
}

export default function SupportEmail(props: Props): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);

  const font = '12px sans-serif';
  const color = '#777';

  useEffect(() => {
    const context = ref.current?.getContext('2d');
    if (context == null) {
      throw new Error();
    }
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.font = font;
    context.fillStyle = color;
    context.fillText(props.email, 0, 13);
  }, [ref.current]);
  return <canvas ref={ref} width={280} height={16} />;
}
