import { requestNotificationPermission } from '@/lib/notifications';
import { useState } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';

import { Avatar } from '@/components/item-row';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Header } from '@/components/header';
import { Screen } from '@/components/screen';
import { Stepper } from '@/components/stepper';
import { Text } from '@/components/text';
import { FREE_ITEM_LIMIT, MAX_RECIPIENTS } from '@/data/sample';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isPlausiblePhone } from '@/lib/whatsapp';
import { useInventory } from '@/store/inventory';
import type { Reminders } from '@/types';

function Row({ title, hint, right }: { title: string; hint?: string; right: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 60, paddingVertical: 8 }}>
      <View style={{ flex: 1 }}>
        <Text variant="h3">{title}</Text>
        {hint ? (
          <Text variant="tiny" color="textMuted">
            {hint}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    t, settings, items, setLanguage, setPayday, setReminder, addRecipient, removeRecipient, resetDemo, clearAll,
  } = useInventory();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);

  const inputStyle = {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bg,
    color: theme.text,
    fontFamily: fontFor(600),
    fontSize: 15,
  } as const;

  function saveContact() {
    if (!name.trim() || !isPlausiblePhone(phone) || !addRecipient(name, phone)) {
      setError(true);
      return;
    }
    setName('');
    setPhone('');
    setError(false);
    setAdding(false);
  }

  const reminders: { key: keyof Reminders; title: string; hint: string }[] = [
    { key: 'expiry', title: t('settings.remindExpiry'), hint: t('settings.remindExpiryHint') },
    { key: 'low', title: t('settings.remindLow'), hint: t('settings.remindLowHint') },
    { key: 'weekly', title: t('settings.remindWeekly'), hint: t('settings.remindWeeklyHint') },
  ];

  return (
    <Screen insetBottom>
      <Header title={t('settings.title')} />

      <Text variant="label" color="textMuted">
        {t('settings.language')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="English" selected={settings.language === 'en'} onPress={() => setLanguage('en')} />
        <Chip label="Bahasa Melayu" selected={settings.language === 'ms'} onPress={() => setLanguage('ms')} />
      </View>

      <Text variant="label" color="textMuted" style={{ marginTop: 10 }}>
        {t('settings.household')}
      </Text>
      <Card style={{ paddingVertical: 4 }}>
        <Row
          title={t('settings.payday')}
          hint={`${t('settings.paydayHint')} · ${t('settings.paydayValue', { n: settings.paydayDay })}`}
          right={
            <Stepper
              value={settings.paydayDay}
              min={1}
              max={31}
              onChange={setPayday}
              decreaseLabel={`${t('settings.payday')} −`}
              increaseLabel={`${t('settings.payday')} +`}
            />
          }
        />
      </Card>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text variant="h3">{t('settings.recipients')}</Text>
          <Text variant="tiny" weight={700} color="primaryDark">
            {t('settings.recipientsCount', { n: settings.recipients.length, max: MAX_RECIPIENTS })}
          </Text>
        </View>
        {settings.recipients.map((r, i) => (
          <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
            <Avatar name={r.name} index={i} size={32} />
            <Text variant="h3" style={{ flex: 1 }}>
              {r.name}
            </Text>
            <Text variant="small" color="textMuted">
              {r.phone}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('common.remove')} ${r.name}`}
              onPress={() => removeRecipient(r.id)}
              hitSlop={8}
              style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text variant="small" weight={700} color="redText">
                {t('common.remove')}
              </Text>
            </Pressable>
          </View>
        ))}
        {adding ? (
          <View style={{ gap: 8 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('settings.contactName')}
              placeholderTextColor={theme.textMuted}
              accessibilityLabel={t('settings.contactName')}
              style={inputStyle}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder={t('settings.contactPhone')}
              placeholderTextColor={theme.textMuted}
              accessibilityLabel={t('settings.contactPhone')}
              style={inputStyle}
            />
            {error ? (
              <Text variant="tiny" color="redText">
                {t('settings.contactInvalid')}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={t('common.cancel')} variant="secondary" small style={{ flex: 1 }} onPress={() => setAdding(false)} />
              <Button label={t('common.save')} small style={{ flex: 1 }} onPress={saveContact} />
            </View>
          </View>
        ) : settings.recipients.length < MAX_RECIPIENTS ? (
          <Button label={`+ ${t('settings.addContact')}`} variant="dashed" small onPress={() => setAdding(true)} />
        ) : null}
      </Card>

      <Text variant="label" color="textMuted" style={{ marginTop: 10 }}>
        {t('settings.reminders')}
      </Text>
      <Card style={{ paddingVertical: 4 }}>
        {reminders.map((reminder) => (
          <Row
            key={reminder.key}
            title={reminder.title}
            hint={reminder.hint}
            right={
              <Switch
                value={settings.reminders[reminder.key]}
                onValueChange={async (value) => {
                  if (value && !(await requestNotificationPermission())) {
                    Alert.alert(t('settings.notifyDenied'));
                    return;
                  }
                  setReminder(reminder.key, value);
                }}
                trackColor={{ true: theme.primary, false: theme.track }}
                accessibilityLabel={reminder.title}
              />
            }
          />
        ))}
      </Card>
      <Text variant="tiny" color="textMuted">
        {t('settings.remindersNote')}
      </Text>

      <Text variant="label" color="textMuted" style={{ marginTop: 10 }}>
        {t('settings.plan')}
      </Text>
      <Card style={{ gap: 2 }}>
        <Text variant="h3">{t('settings.freePlan')}</Text>
        <Text variant="small" color="textMuted">
          {t('settings.freeUsage', { used: items.length, max: FREE_ITEM_LIMIT })}
        </Text>
      </Card>

      <Text variant="label" color="textMuted" style={{ marginTop: 10 }}>
        {t('settings.data')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label={t('settings.resetDemo')} variant="secondary" small style={{ flex: 1 }} onPress={resetDemo} />
        <Button
          label={t('settings.clearAll')}
          variant="danger"
          small
          style={{ flex: 1 }}
          onPress={() =>
            Alert.alert(t('settings.confirmClear'), undefined, [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('settings.clearAll'), style: 'destructive', onPress: clearAll },
            ])
          }
        />
      </View>
    </Screen>
  );
}
