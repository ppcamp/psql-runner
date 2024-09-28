import { TextDocument } from "vscode";

export function statmentFromDocument(document: TextDocument, startLine: number, endLine: number): string {
    let capturedText = '';

    // Iterate through the lines in the selected range
    for (let lineIndex = startLine; lineIndex < endLine; lineIndex++) {
        const line = document.lineAt(lineIndex).text;
        const semicolonIndex = line.indexOf(';');
        if (semicolonIndex !== -1) {
            // Capture text until the semicolon
            capturedText += line.substring(0, semicolonIndex);
            return capturedText;
        } else {
            // If no semicolon, add the entire line
            capturedText += line + ' ';
        }
    }
    return capturedText;
}