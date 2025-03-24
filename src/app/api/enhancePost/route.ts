import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const instruction = `Enhance the following text slightly to make it more engaging and polished, also reply back the enhanced sentence directly not the build up: "${prompt}"`;
    const response = await hf.textGeneration({
      model: 'meta-llama/Llama-3.2-1B-Instruct', 
      inputs: instruction,
      parameters: {
        max_length: 25, 
        temperature: 0.9, 
      },
    });

    return NextResponse.json({ result: response.generated_text });
  } catch (error) {
    console.error('Error in text generation:', error);
    return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
  }
}