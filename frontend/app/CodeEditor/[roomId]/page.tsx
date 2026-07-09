


import TheEditorComponent from "@/app/components/CodeEditor";
import { WebsocketProvider } from "@/app/context/WebsocketContext";

type Slug = {
  params: Promise<{ roomId: string }>
}


export default async function TheEditor({ params }: Slug) {
  const { roomId } = await params;


  return (
    <WebsocketProvider roomId={roomId}>
      <TheEditorComponent  />
    </WebsocketProvider>


  );
}