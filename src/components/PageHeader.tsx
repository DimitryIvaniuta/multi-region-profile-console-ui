type PageHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
};

export const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => (
  <section className="page-header">
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <p>{description}</p>
  </section>
);
