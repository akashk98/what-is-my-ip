# AK World - Online Tools

A collection of browser-based tools built with Next.js, including What Is My IP and Find & Copy Files.

## Features

- IPv4 & IPv6 Detection
- Browser Information
- Operating System
- Device Type
- ISP
- ASN
- Organization
- Timezone
- Language
- Screen Resolution
- Copy IP
- Share
- Refresh
- Find files by exact name, including names without file extensions
- Copy selected matches to another folder without changing the originals
- Export a CSV report of search and copy results

## Find & Copy Files privacy and browser support

The Find & Copy Files page reads the folders and filename lists you select locally in your browser. It does not upload
file contents, paths, or names to the application, and it does not save them in cookies or browser storage. Standard
website request metadata may still be recorded by the hosting provider.

Desktop browsers with the File System Access API (such as current Chrome and Edge) can choose source and destination
folders. Other browsers can select a source folder and download matching files individually; they may not support
copying directly into a chosen destination folder. The report uses paths relative to the selected source folder.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS

## Getting Started

Install Node.js, then install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Using Find & Copy Files

1. Open **Find & Copy Files** from the homepage or site navigation.
2. Select the source folder. Choose whether to include its subfolders.
3. Paste one requested filename per line, or load a TXT file or a CSV whose first column contains filenames.
4. Optionally filter by extension, then select **Search Files**. Matching is case-insensitive and exact; a name without
   an extension matches the complete filename stem, not a partial name.
5. Review and select the matches. Choose whether existing destination filenames should be skipped, renamed, or kept in
   their original folder structure.
6. Select a destination folder (or create a subfolder inside it), then choose **Copy Selected Files** and confirm.
   Browsers without folder-writing support download the selected files individually instead.
7. Use **Export Report** to download the results as CSV.

## License

MIT
