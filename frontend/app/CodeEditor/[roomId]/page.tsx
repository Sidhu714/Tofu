


import TheEditorComponent from "@/app/components/CodeEditor";

type Slug = {
  params : Promise<{ roomId : string}>
}


export default async function TheEditor({ params } : Slug) {
  const { roomId } = await params;

  
  return (
    <>
      <TheEditorComponent roomId={roomId} />
    </>


  );
}