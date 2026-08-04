interface PageProps {
  params: {
    workflowId: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { workflowId } = await params;
  return <div>workflowId: {workflowId}</div>;
};

export default page;
