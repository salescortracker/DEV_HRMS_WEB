import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
//import * as mammoth from 'mammoth';

@Injectable({
  providedIn: 'root'
})
export class ResumeParserService {

  private platformId = inject(PLATFORM_ID);

  async extractText(file: File): Promise<string> {

    const fileName = file.name.toLowerCase();

    // ================= PDF =================
    if (fileName.endsWith('.pdf')) {

      // SSR protection
      if (!isPlatformBrowser(this.platformId)) {
        return '';
      }

      // Dynamic import
      //const pdfjsLib = await import('pdfjs-dist');

      // pdfjsLib.GlobalWorkerOptions.workerSrc =
      //   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

      // const buffer = await file.arrayBuffer();

      // const pdf = await pdfjsLib.getDocument({
      //   data: buffer
      // }).promise;

     // let text = '';

      // for (let i = 1; i <= pdf.numPages; i++) {

      //   const page = await pdf.getPage(i);

      //   const content = await page.getTextContent();

      //   text += content.items
      //     .map((x: any) => x.str)
      //     .join(' ') + ' ';
      // }

    //  return text.trim();
    }

    // ================= DOCX =================

    if (fileName.endsWith('.docx')) {

      const arrayBuffer = await file.arrayBuffer();

      // const result = await mammoth.extractRawText({
      //   arrayBuffer
      // });

     // return result.value;
    }

    return '';
  }
}