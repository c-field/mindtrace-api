export const downloadCSV = (csvContent: string, filename: string = 'mindtrace-thoughts.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const shareData = (data: string, filename: string = 'mindtrace-thoughts.csv') => {
  if (navigator.share) {
    const file = new File([data], filename, { type: 'text/csv' });
    navigator.share({
      files: [file],
      title: 'MindTrace Thoughts Export',
      text: 'My thought tracking data from MindTrace'
    }).catch(console.error);
  } else {
    // Fallback to download
    downloadCSV(data, filename);
  }
};
