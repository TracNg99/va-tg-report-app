import { Box, Modal, Text, useMantineTheme } from '@mantine/core';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

const baseUrl = 'https://fork-tbp-fe-hosting.vercel.app';

type QRModalComponentProps = {
  contentId: string;
  displayText: string;
  locationId?: string;
  backgroundImage?: string;
  open: boolean;
  onClose: () => void;
};

const QRModal: React.FC<QRModalComponentProps> = ({
  displayText,
  contentId,
  backgroundImage,
  open,
  onClose,
}) => {
  const [qr, setQr] = useState<string | null>(null);
  const theme = useMantineTheme();

  const url = `${baseUrl}/experiences/${contentId}`;

  useEffect(() => {
    if (open) {
      QRCode.toDataURL(
        url,
        {
          scale: 10,
        },
        (err: Error | null | undefined, url: string) => {
          if (!err) {
            setQr(url);
          }
        },
      );
    } else {
      setQr(null);
    }
  }, [open, url]);

  return (
    <Modal
      opened={open}
      onClose={onClose}
      centered
      overlayProps={{
        color: theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          backgroundImage: backgroundImage
            ? `url("${backgroundImage}")`
            : undefined,
          backgroundColor: !backgroundImage
            ? theme.colors.gray[1]
            : 'transparent',
        },
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          width: '90%',
          maxWidth: 600,
          maxHeight: '90vh',
          alignItems: 'center',
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
        }}
      >
        {qr ? (
          <img src={qr} alt="QR Code" style={{ width: '350px' }} />
        ) : (
          <Text>Loading...</Text>
        )}

        <Text size="xl" fw={700} c="black">
          {displayText}
        </Text>
      </Box>
    </Modal>
  );
};

export default QRModal;
