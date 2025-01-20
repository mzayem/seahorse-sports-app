interface ContainerProps {
  title: string;
  description: string;
  isVisible?: boolean;
  children?: React.ReactNode;
}

export const Container = ({
  title,
  description,
  isVisible,
  children,
}: ContainerProps) => {
  return (
    <div
      className={`mx-auto max-w-4xl space-y-8 px-2 md:px-6 transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
};
