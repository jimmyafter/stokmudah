import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { fontFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  buildWhatsAppMessage,
  estimateTotal,
  extraToLine,
  groupByLocation,
  sectionLabel,
  suggestedLines,
  type ListLine,
} from '@/lib/shopping';
import { toISODate, addDays } from '@/lib/dates';
import { whatsappShareUrl, whatsappUrl } from '@/lib/whatsapp';
import { useInventory } from '@/store/inventory';

function paydayDate(day: number, today: Date): Date {
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), Math.min(day, 28));
  return thisMonth >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
    ? thisMonth
    : new Date(today.getFullYear(), today.getMonth() + 1, Math.min(day, 28));
}

export default function ShopScreen() {
  const theme = useTheme();
  const { items, extras, excluded, settings, t, language, addExtra, removeExtra, toggleExcluded } = useInventory();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [queue, setQueue] = useState<string[]>([]);

  const today = new Date();
  const lines = useMemo<ListLine[]>(
    () => [...suggestedLines(items, today), ...extras.map(extraToLine)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, extras],
  );
  const checked = lines.filter((line) => !excluded[line.id]);
  const total = estimateTotal(checked);
  const groups = groupByLocation(lines);
  const payday = paydayDate(settings.paydayDay, today);
  const paydayLabel = payday.toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-MY', {
    day: 'numeric',
    month: 'short',
  });

  const recipients = settings.recipients;
  const isSelected = (id: string) => selected[id] ?? true;
  const chosen = recipients.filter((r) => isSelected(r.id));

  const message = () => buildWhatsAppMessage(checked, language, toISODate(addDays(today, 0)).slice(5).split('-').reverse().join('/'));

  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('shop.openFailed'));
    }
  }

  async function send() {
    if (checked.length === 0 || chosen.length === 0) return;
    const [first, ...rest] = chosen;
    setQueue(rest.map((r) => r.id));
    await open(whatsappUrl(first.phone, message()));
  }

  async function sendNext() {
    const [nextId, ...rest] = queue;
    const recipient = recipients.find((r) => r.id === nextId);
    setQueue(rest);
    if (recipient) await open(whatsappUrl(recipient.phone, message()));
  }

  function submitExtra() {
    if (draft.trim()) addExtra(draft);
    setDraft('');
    setAdding(false);
  }

  const nextRecipient = recipients.find((r) => r.id === queue[0]);

  return (
    <Screen
      footer={
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text variant="tiny" weight={700} color="textMuted">
              {t('shop.sendTo')}
            </Text>
            {recipients.map((r) => (
              <Chip
                key={r.id}
                label={`${isSelected(r.id) ? '✓ ' : ''}${r.name}`}
                selected={isSelected(r.id)}
                onPress={() => setSelected((s) => ({ ...s, [r.id]: !isSelected(r.id) }))}
              />
            ))}
            <Chip label={t('shop.group')} onPress={() => open(whatsappShareUrl(message()))} disabled={checked.length === 0} />
          </View>
          {recipients.length === 0 ? (
            <Text variant="tiny" color="textMuted">
              {t('shop.noRecipients')}
            </Text>
          ) : null}
          {nextRecipient ? (
            <Button label={t('shop.nextRecipient', { name: nextRecipient.name })} variant="secondary" onPress={sendNext} />
          ) : (
            <Button
              label={t('shop.sendCount', { n: chosen.length })}
              variant="whatsapp"
              icon={<Icon name="chat" color={theme.onWhatsapp} size={22} strokeWidth={2} />}
              disabled={checked.length === 0 || chosen.length === 0}
              onPress={send}
            />
          )}
        </>
      }>
      <View style={{ gap: 4 }}>
        <Text variant="title">{t('shop.title')}</Text>
        <Text variant="small" color="textMuted">
          {t('shop.payday', { date: paydayLabel })} · {t('shop.estimate', { n: Math.round(total) })}
        </Text>
      </View>

      <Card tone="soft" style={{ paddingVertical: 10 }}>
        <Text variant="small" color="textSoft">
          {t('shop.note')}
        </Text>
      </Card>

      {groups.length === 0 ? (
        <Text variant="body" color="textMuted">
          {t('shop.empty')}
        </Text>
      ) : (
        groups.map((group) => (
          <View key={group.location} style={{ gap: 8, marginTop: 4 }}>
            <Text variant="label" color="textMuted">
              {sectionLabel(group.location, language)}
            </Text>
            {group.lines.map((line) => {
              const on = !excluded[line.id];
              const reason =
                line.reason === 'low' ? t('shop.reasonLow') : line.reason === 'expiring' ? t('shop.reasonExpiring') : t('shop.reasonExtra');
              return (
                <Pressable
                  key={line.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${line.name} × ${line.qty}`}
                  onPress={() => toggleExcluded(line.id)}
                  onLongPress={line.reason === 'extra' ? () => removeExtra(line.id) : undefined}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 56,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 16,
                  }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? theme.primary : 'transparent',
                      borderWidth: on ? 0 : 2,
                      borderColor: theme.border,
                    }}>
                    {on ? <Icon name="check" color={theme.onPrimary} size={16} strokeWidth={3} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3" style={{ opacity: on ? 1 : 0.5 }}>
                      {line.name} × {line.qty}
                    </Text>
                    <Text variant="tiny" color="textMuted">
                      {reason}
                      {line.estimate !== undefined ? ` · RM ${line.estimate.toFixed(2)}` : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))
      )}

      {adding ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submitExtra}
            returnKeyType="done"
            placeholder={t('shop.addPlaceholder')}
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={t('shop.addPlaceholder')}
            style={{
              flex: 1,
              minHeight: 48,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: theme.primary,
              backgroundColor: theme.surface,
              color: theme.text,
              fontFamily: fontFor(600),
              fontSize: 15,
            }}
          />
          <Button label={t('common.add')} small onPress={submitExtra} />
        </View>
      ) : (
        <Button
          label={t('shop.addOther')}
          variant="dashed"
          icon={<Icon name="plus" color={theme.primaryDark} size={20} strokeWidth={2.2} />}
          onPress={() => setAdding(true)}
        />
      )}
    </Screen>
  );
}
