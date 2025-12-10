export default function PublicationsPageHeader({ title, description }) {
  return (
    <div className="page-header">
      <div className="container">
        <h2 className="mb-1">{title}</h2>
        <p className="mb-0">{description}</p>
      </div>
    </div>
  );
}
