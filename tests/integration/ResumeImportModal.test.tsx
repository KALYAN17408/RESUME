import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeImportModal } from '@/features/resumes/components/ResumeImportModal/ResumeImportModal';
import { ResumeService } from '@/features/resumes/services/resumeService';

describe('ResumeImportModal Component', () => {
  it('renders modal when open with file dropzone and options', () => {
    render(
      <ResumeImportModal
        isOpen={true}
        onClose={vi.fn()}
        userId="user_import_test"
        onImportSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Import Resume from Device')).toBeInTheDocument();
    expect(screen.getByText(/Click to browse or drag & drop resume file/i)).toBeInTheDocument();
  });

  it('handles file selection and displays filename and template selector', async () => {
    render(
      <ResumeImportModal
        isOpen={true}
        onClose={vi.fn()}
        userId="user_import_test"
        onImportSuccess={vi.fn()}
      />
    );

    const mockFile = new File(['Candidate: Jane Doe\nEmail: jane@test.com'], 'jane_resume.txt', {
      type: 'text/plain',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('jane_resume.txt')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Imported - jane_resume')).toBeInTheDocument();
      expect(screen.getByText("Jake's Technical")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import to workspace/i })).toBeEnabled();
    });
  });

  it('executes import and invokes onImportSuccess', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    vi.spyOn(ResumeService, 'saveResume').mockResolvedValue({ success: true, isRemote: false });

    render(
      <ResumeImportModal
        isOpen={true}
        onClose={handleClose}
        userId="user_import_test"
        onImportSuccess={handleSuccess}
      />
    );

    const mockFile = new File(
      ['Full Name: John Smith\nEmail: john@smith.org\nExperience:\nSoftware Engineer at Google\n• Built search features'],
      'john_resume.txt',
      { type: 'text/plain' }
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import to workspace/i })).toBeEnabled();
    });

    const importBtn = screen.getByRole('button', { name: /import to workspace/i });
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      const passedResume = handleSuccess.mock.calls[0][0];
      expect(passedResume.title).toContain('Imported - john_resume');
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
