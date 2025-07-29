export const downloadCSV = (csvContent, filename = 'mindtrace-thoughts.csv') => {
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

export const shareData = (data, filename = 'mindtrace-thoughts.csv') => {
  if (navigator.share && navigator.canShare) {
    const file = new File([data], filename, { type: 'text/csv' });
    
    if (navigator.canShare({ files: [file] })) {
      navigator.share({
        title: 'MindTrace Thoughts Export',
        text: 'My thought tracking data from MindTrace',
        files: [file]
      }).catch(err => {
        console.log('Error sharing:', err);
        // Fallback to download
        downloadCSV(data, filename);
      });
    } else {
      // Fallback to download if file sharing not supported
      downloadCSV(data, filename);
    }
  } else {
    // Fallback to download if Web Share API not supported
    downloadCSV(data, filename);
  }
};