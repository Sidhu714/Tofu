'use client'

import { Box,Text,Button,VStack } from "@chakra-ui/react";
import  { executeCode } from  "@/lib/api"
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useWebsocket } from "@/hooks/useWebsocket";

export default function Output({editorRef,language} : {editorRef: any,language : string}) {
  const toast = useToast();
   const [codeOutput,setCodeOutput] = useState<String[]>([]);
   const [isLoading,setIsLoading] = useState(false);
   const [isError,setIsError] = useState(false);

   const { socket,isConnected,sendMessage} = useWebsocket();

   
   useEffect(() => {
    if (socket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'output') {
          setCodeOutput(data.output);
        }
      };

      socket.addEventListener('message', handleMessage);

      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, [socket]);

 
  const output = async () =>{
    setIsLoading(true);
    const sourceCode = editorRef.current.getValue();
    if(!sourceCode) return
    try {
      const result = await executeCode(language,sourceCode);

      console.log(result.output);

      const outputLines = result.output.split("\n");
      setCodeOutput(outputLines);

      if (isConnected) {
        sendMessage({
          type: "output",
          output: outputLines
        });
      }
      
      result.stderr ? setIsError(true) : setIsError(false);
      
    } catch (error) {
      console.error(error);
      toast({
        title : "An error occured",
        description : "Unable to run code",
        status : "error",
        duration : 6000,
      })
    }finally{
      setIsLoading(false);
    }
  }


  return (
    <Box ml={2} className="p-4">
        <Text mb={4} fontSize="lg">
            <span className="text-sm font-extrabold">Output:</span>
        </Text>
        <Button
            variant={"default"}
            mb={4}
        onClick={output}
        isLoading={isLoading}
        className="px-2 py-1 bg-black  text-white text-center font-sans font-medium border-neutral-800 rounded-sm "
      >
       <span className="text-sm font-medium">Run Code</span>
      </Button>
      <Box
        height="87vh"
        width="40vw"
        p={2}
        color={isError ? "red.400" : "" }
        border="2px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
        className="bg-neutral-900 text-white mt-1.5 overflow-auto"
      >
        {codeOutput.length > 0 ? (
           <VStack align="start" spacing={1}>
           {codeOutput.map((code, index) => (
             <Text key={index}><code>{code}</code></Text>
           ))}
         </VStack>
        ) : (
          <Text>Click Run Code to see the output here</Text>
        )}
    </Box>
    </Box>
  );
} 
