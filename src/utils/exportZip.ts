import JSZip from 'jszip';
import { FileItem, ProjectItem, TaskItem, ReminderItem } from '../types';

/**
 * Builds the folder path for a given file item based on parent folder hierarchy
 */
const getFilePath = (file: FileItem, files: FileItem[]): string => {
  const pathParts: string[] = [];
  let currentParentId = file.parentId;

  // Prevent infinite loops if there are circular references
  const visited = new Set<string>();

  while (currentParentId && !visited.has(currentParentId)) {
    visited.add(currentParentId);
    const parent = files.find((f) => f.id === currentParentId);
    if (!parent) break;
    // Clean folder name to remove slashes
    const cleanName = parent.name.replace(/[/\\?%*:|"<>]/g, '_');
    pathParts.unshift(cleanName);
    currentParentId = parent.parentId;
  }

  return pathParts.join('/');
};

/**
 * Converts projects to CSV format
 */
const projectsToCsv = (projects: ProjectItem[]): string => {
  const headers = ['ID', 'Title', 'Category/Domain', 'Status', 'Progress (%)', 'Target Date', 'Priority', 'Key Results'];
  const rows = projects.map((p) => {
    const krSummary = p.keyResults.map((kr) => `[${kr.done ? 'x' : ' '}] ${kr.text}`).join('; ');
    return [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.status}"`,
      `"${p.progress}"`,
      `"${p.targetDate || ''}"`,
      `"${p.priority}"`,
      `"${krSummary.replace(/"/g, '""')}"`,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Converts tasks to CSV format
 */
const tasksToCsv = (tasks: TaskItem[]): string => {
  const headers = ['ID', 'Title', 'Priority', 'Status', 'Due Date', 'Estimate', 'Domain', 'Category', 'Project ID', 'Goal'];
  const rows = tasks.map((t) => {
    return [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.priority}"`,
      `"${t.completed ? 'Completed' : 'Pending'}"`,
      `"${t.dueDate || ''}"`,
      `"${t.timeEstimate || ''}"`,
      `"${t.domain || ''}"`,
      `"${t.category || ''}"`,
      `"${t.projectId || ''}"`,
      `"${t.goalTitle || ''}"`,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Helper to trigger browser download of a generated blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Exports all Second Brain notes and documents preserving folder hierarchy into a ZIP archive
 */
export const exportSecondBrainZip = async (files: FileItem[]): Promise<string> => {
  const zip = new JSZip();
  const notesFolder = zip.folder('Second_Brain') || zip;

  const noteFiles = files.filter((f) => f.type === 'file');

  noteFiles.forEach((file) => {
    const relativeDir = getFilePath(file, files);
    let fileName = file.name;
    const ext = file.extension || 'md';
    if (!fileName.endsWith(`.${ext}`)) {
      fileName = `${fileName}.${ext}`;
    }

    const folderTarget = relativeDir ? notesFolder.folder(relativeDir) || notesFolder : notesFolder;

    // Build markdown content with frontmatter metadata
    const tagsHeader = file.tags && file.tags.length > 0 ? `tags: [${file.tags.join(', ')}]\n` : '';
    const dateHeader = file.updatedAt ? `updatedAt: ${file.updatedAt}\n` : '';
    const frontmatter = tagsHeader || dateHeader ? `---\n${tagsHeader}${dateHeader}---\n\n` : '';

    folderTarget.file(fileName, frontmatter + (file.content || ''));
  });

  // Add a manifest README
  const readme = `# Second Brain Export
Generated: ${new Date().toLocaleString()}
Total Notes: ${noteFiles.length}

All markdown notes and documents have been exported with their folder organization preserved.
`;
  zip.file('README.md', readme);

  const timestamp = new Date().toISOString().slice(0, 10);
  const zipName = `second_brain_vault_${timestamp}.zip`;

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, zipName);
  return zipName;
};

/**
 * Exports complete Operating System workspace data into a ZIP archive
 */
export const exportFullSystemZip = async (data: {
  files: FileItem[];
  projects: ProjectItem[];
  tasks: TaskItem[];
  reminders: ReminderItem[];
}): Promise<string> => {
  const zip = new JSZip();

  // 1. Second Brain Notes
  const sbFolder = zip.folder('Second_Brain');
  const noteFiles = data.files.filter((f) => f.type === 'file');

  noteFiles.forEach((file) => {
    const relativeDir = getFilePath(file, data.files);
    let fileName = file.name;
    const ext = file.extension || 'md';
    if (!fileName.endsWith(`.${ext}`)) {
      fileName = `${fileName}.${ext}`;
    }

    const folderTarget = relativeDir && sbFolder ? sbFolder.folder(relativeDir) || sbFolder : sbFolder || zip;

    const tagsHeader = file.tags && file.tags.length > 0 ? `tags: [${file.tags.join(', ')}]\n` : '';
    const dateHeader = file.updatedAt ? `updatedAt: ${file.updatedAt}\n` : '';
    const frontmatter = tagsHeader || dateHeader ? `---\n${tagsHeader}${dateHeader}---\n\n` : '';

    folderTarget.file(fileName, frontmatter + (file.content || ''));
  });

  // 2. Structured Databases
  const dbFolder = zip.folder('Databases');
  if (dbFolder) {
    // Projects JSON & CSV
    dbFolder.file('projects.json', JSON.stringify(data.projects, null, 2));
    dbFolder.file('projects.csv', projectsToCsv(data.projects));

    // Tasks JSON & CSV
    dbFolder.file('tasks.json', JSON.stringify(data.tasks, null, 2));
    dbFolder.file('tasks.csv', tasksToCsv(data.tasks));

    // Reminders JSON
    dbFolder.file('reminders.json', JSON.stringify(data.reminders, null, 2));
  }

  // 3. Complete system JSON snapshot for easy restore
  zip.file(
    'system_backup_full.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        files: data.files,
        projects: data.projects,
        tasks: data.tasks,
        reminders: data.reminders,
      },
      null,
      2
    )
  );

  // 4. Readme overview
  const readme = `# AetherOS System Backup Archive
Export Date: ${new Date().toLocaleString()}

### Contents:
- **Second_Brain/**: All notes, specifications, and captures in their PARA directory tree.
- **Databases/**: 
  - \`projects.json\` & \`projects.csv\` - Complete project tracker with key results & milestones
  - \`tasks.json\` & \`tasks.csv\` - Task matrix with priorities, dates, domains, and estimations
  - \`reminders.json\` - Important reminders log
- **system_backup_full.json**: Machine-readable full workspace backup snapshot.

Thank you for using AetherOS!
`;
  zip.file('README.md', readme);

  const timestamp = new Date().toISOString().slice(0, 10);
  const zipName = `aetheros_backup_${timestamp}.zip`;

  const content = await zip.generateAsync({ type: 'blob' });
  triggerDownload(content, zipName);
  return zipName;
};
