import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddItemForm } from '@/components/add-item-form';
import { Button } from '@/components/button';
import { Icon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { lookupBarcode, type LookupResult } from '@/lib/product-lookup';
import { useInventory } from '@/store/inventory';

type Stage =
  | { name: 'scan' }
  | { name: 'lookup'; barcode: string }
  | { name: 'form'; barcode?: string; initialName: string; lookup: LookupResult['status'] | 'none' };

const MODES = ['barcode', 'item', 'expiry', 'receipt'] as const;

export default function CameraScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, items, addPurchase } = useInventory();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>({ name: 'scan' });
  const handled = useRef(false);

  function close() {
    router.back();
  }

  async function onScanned(code: string) {
    if (handled.current) return;
    handled.current = true;
    // A barcode you have scanned before is remembered, so skip the network.
    const known = items.find((item) => item.barcode === code);
    if (known) {
      setStage({ name: 'form', barcode: code, initialName: known.name, lookup: 'found' });
      return;
    }
    setStage({ name: 'lookup', barcode: code });
    const product = await lookupBarcode(code);
    setStage({
      name: 'form',
      barcode: code,
      initialName: product.status === 'found' ? product.name : '',
      lookup: product.status,
    });
  }

  function bannerFor(form: Extract<Stage, { name: 'form' }>): string | undefined {
    const code = form.barcode ? ` (${form.barcode})` : '';
    if (form.lookup === 'found') return t('camera.found') + code;
    if (form.lookup === 'notfound') return t('camera.notFound') + code;
    if (form.lookup === 'error') return t('camera.lookupFailed') + code;
    return undefined;
  }

  if (stage.name === 'form') {
    return (
      <AddItemForm
        initialName={stage.initialName}
        barcode={stage.barcode}
        banner={bannerFor(stage)}
        onCancel={() => {
          handled.current = false;
          setStage({ name: 'scan' });
        }}
        onSave={(purchase) => {
          addPurchase(purchase);
          close();
        }}
      />
    );
  }

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#121A16' }} />;

  if (!permission.granted) {
    return (
      <Screen
        insetBottom
        footer={
          <>
            <Button label={t('camera.allow')} onPress={requestPermission} />
            <Button
              label={t('camera.manual')}
              variant="secondary"
              onPress={() => setStage({ name: 'form', initialName: '', lookup: 'none' })}
            />
          </>
        }>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}>
          <Icon name="close" color={theme.text} size={24} strokeWidth={2} />
        </Pressable>
        <Text variant="title">{t('camera.permissionTitle')}</Text>
        <Text variant="body" color="textMuted">
          {t('camera.permissionBody')}
        </Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121A16' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={stage.name === 'scan' ? ({ data }) => onScanned(data) : undefined}
      />

      <View style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={close}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" color="#FFFFFF" size={22} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={{ position: 'absolute', top: insets.top + 72, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
        {MODES.map((m) => {
          const active = m === 'barcode';
          return (
            <View
              key={m}
              accessible
              accessibilityState={{ selected: active, disabled: !active }}
              style={{
                minHeight: 40,
                paddingHorizontal: 14,
                borderRadius: 999,
                justifyContent: 'center',
                backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.16)',
                opacity: active ? 1 : 0.6,
              }}>
              <Text variant="small" weight={active ? 700 : 600} style={{ color: active ? '#1B2B24' : '#FFFFFF' }}>
                {t(`mode.${m}` as const)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ position: 'absolute', left: 55, right: 55, top: '32%', height: 170 }} pointerEvents="none">
        {[
          { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 },
          { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 },
          { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 },
          { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 },
        ].map((corner, i) => (
          <View key={i} style={[{ position: 'absolute', width: 36, height: 36, borderColor: '#7FD6BE' }, corner]} />
        ))}
      </View>

      <View style={{ position: 'absolute', left: 20, right: 20, bottom: insets.bottom + 20, gap: 10 }}>
        <View style={{ alignSelf: 'center', backgroundColor: 'rgba(18,26,22,0.8)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {stage.name === 'lookup' ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
          <Text variant="small" weight={600} style={{ color: '#FFFFFF' }}>
            {stage.name === 'lookup' ? t('camera.lookingUp') : t('camera.scanHint')}
          </Text>
        </View>
        {mode === 'receipt' ? (
          <Text variant="tiny" style={{ color: '#FFFFFF', textAlign: 'center' }}>
            {t('camera.photoSoon')}
          </Text>
        ) : null}
        <Button
          label={t('camera.manual')}
          variant="secondary"
          onPress={() => setStage({ name: 'form', initialName: '', lookup: 'none' })}
        />
      </View>
    </View>
  );
}
