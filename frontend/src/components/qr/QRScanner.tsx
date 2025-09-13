import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { FaCamera, FaStop, FaTimes } from 'react-icons/fa';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isActive: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    // カメラデバイスを取得
    const getDevices = async () => {
      try {
        const videoInputDevices = await reader.listVideoInputDevices();
        setDevices(videoInputDevices);
        
        // 背面カメラを優先的に選択
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCamera) {
          setSelectedDeviceId(backCamera.deviceId);
        } else if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      } catch (err) {
        console.error('カメラデバイスの取得に失敗しました:', err);
        setError('カメラデバイスにアクセスできません');
      }
    };

    getDevices();

    return () => {
      reader.reset();
    };
  }, []);

  useEffect(() => {
    if (isActive && selectedDeviceId && codeReader && videoRef.current) {
      startScanning();
    }
    
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [isActive, selectedDeviceId, codeReader]);

  const startScanning = async () => {
    if (!codeReader || !videoRef.current || !selectedDeviceId) return;

    try {
      setIsScanning(true);
      setError('');

      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedText = result.getText();
            console.log('QRコード読み取り成功:', scannedText);
            onScan(scannedText);
          }
          
          if (err && !(err instanceof NotFoundException)) {
            console.error('スキャンエラー:', err);
          }
        }
      );
    } catch (err) {
      console.error('スキャン開始エラー:', err);
      setError('カメラの開始に失敗しました');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isScanning) {
      stopScanning();
      setTimeout(() => {
        if (isActive) {
          startScanning();
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaCamera className="text-blue-600" />
              QRコードスキャン
            </h3>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <FaTimes />
            </Button>
          </div>

          {/* カメラ選択 */}
          {devices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カメラを選択
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `カメラ ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ビデオ表示エリア */}
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg object-cover"
              playsInline
              muted
            />
            
            {/* スキャンフレーム */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>

            {/* スキャン状態表示 */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                isScanning 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {isScanning ? 'スキャン中...' : 'スキャン停止中'}
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* 操作ボタン */}
          <div className="flex gap-3">
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              className={`flex-1 ${
                isScanning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              disabled={!selectedDeviceId}
            >
              {isScanning ? (
                <>
                  <FaStop className="mr-2" />
                  停止
                </>
              ) : (
                <>
                  <FaCamera className="mr-2" />
                  開始
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Button>
          </div>

          {/* 使用方法 */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs">
              📱 QRコードをカメラのフレーム内に合わせてください。自動的に読み取ります。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
