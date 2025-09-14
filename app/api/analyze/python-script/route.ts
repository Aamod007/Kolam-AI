import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('image') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempFileName = `upload-${uuidv4()}-${file.name}`;
  const tempFilePath = join(process.cwd(), 'tmp', tempFileName);

  // Ensure the 'tmp' directory exists
  const tempDir = join(process.cwd(), 'tmp');
  await fs.mkdir(tempDir, { recursive: true });

  try {
    await fs.writeFile(tempFilePath, buffer);

    const command = `python kolam_analyzer_single.py "${tempFilePath}"`;

    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error.message}`);
          if (error.stdout) console.error(`exec stdout: ${error.stdout}`);
          if (error.stderr) console.error(`exec stderr: ${error.stderr}`);
          return reject(error);
        }
        resolve({ stdout, stderr });
      });
    });

    if (stderr) {
      console.warn(`kolam_analyzer_single.py stderr: ${stderr}`);
    }

    try {
      const analysisResult = JSON.parse(stdout);
      return NextResponse.json(analysisResult);
    } catch (parseError) {
      console.error('Failed to parse JSON output from Python script:', parseError);
      console.error('Python script stdout:', stdout);
      return NextResponse.json({ error: 'Failed to parse analysis result from Python script.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error during file processing or script execution:', error);
    return NextResponse.json({ error: 'Internal server error during analysis.' }, { status: 500 });
  } finally {
    // Clean up the temporary file
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error(`Error cleaning up temporary file ${tempFilePath}:`, cleanupError);
    }
  }
}
