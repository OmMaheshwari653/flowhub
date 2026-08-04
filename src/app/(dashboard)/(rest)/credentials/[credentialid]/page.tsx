interface PageProps {
  params: {
    credentialid: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { credentialid } = await params;
  return <div> credentialid: {credentialid} </div>;
};

export default page;
