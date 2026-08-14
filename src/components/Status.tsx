export default function Status({ type='info', children }) {
  if (!children) return null
  return <div className={`status ${type}`}>{children}</div>
}
