export default function index() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'long',
  });
  return <>{`p@◆Updated at ${formatter.format(now)}`}</>;
}
