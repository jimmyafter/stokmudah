import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { Stepper } from '@/components/stepper';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import { makeT } from '@/i18n';
import { useInventory } from '@/store/inventory';
import type { Language } from '@/types';

/** First-run screens: what the app does and language, payday, then demo or empty start. */
export default function Onboarding() {
  const theme = useTheme();
  const { settings, completeOnboarding } = useInventory();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>(settings.language);
  const [payday, setPayday] = useState(settings.paydayDay);
  // Strings follow the language picked on this screen straight away.
  const t = makeT(language);

  const finish = (withDemo: boolean) => completeOnboarding({ language, paydayDay: payday, withDemo });

  const footer =
    step < 2 ? (
      <>
        <Button label={t('common.next')} onPress={() => setStep(step + 1)} />
      </>
    ) : (
      <>
        <Button label={t('onboard.demo')} onPress={() => finish(true)} />
        <Button label={t('onboard.empty')} variant="secondary" onPress={() => finish(false)} />
      </>
    );

  return (
    <Screen footer={footer} insetBottom>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${step + 1} / 3`}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{ width: i === step ? 26 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? theme.primary : theme.track }}
            />
          ))}
        </View>
        {step < 2 ? (
          <Button label={t('common.skip')} variant="ghost" small onPress={() => finish(true)} />
        ) : null}
      </View>

      {step === 0 ? (
        <>
          <View style={{ alignItems: 'center', paddingVertical: 28 }}>
            <View style={{ width: 168, height: 168, borderRadius: 56, backgroundColor: theme.deep, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" color={theme.onDeep} size={76} strokeWidth={1.6} />
            </View>
          </View>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 36 }}>
            {t('onboard.title1')}
          </Text>
          <Text variant="body" color="textSoft">
            {t('onboard.body1')}
          </Text>
          <Text variant="label" color="textMuted" style={{ marginTop: 14 }}>
            {t('onboard.language')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="English" selected={language === 'en'} onPress={() => setLanguage('en')} />
            <Chip label="Bahasa Melayu" selected={language === 'ms'} onPress={() => setLanguage('ms')} />
          </View>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 36, marginTop: 24 }}>
            {t('onboard.title2')}
          </Text>
          <Text variant="body" color="textSoft">
            {t('onboard.body2')}
          </Text>
          <View style={{ alignItems: 'center', gap: 14, marginTop: 28 }}>
            <Stepper
              value={payday}
              min={1}
              max={31}
              onChange={setPayday}
              decreaseLabel="−"
              increaseLabel="+"
            />
            <Text variant="h2">{t('settings.paydayValue', { n: payday })}</Text>
          </View>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 36, marginTop: 24 }}>
            {t('onboard.title3')}
          </Text>
          <Text variant="body" color="textSoft">
            {t('onboard.body3')}
          </Text>
        </>
      ) : null}
    </Screen>
  );
}
