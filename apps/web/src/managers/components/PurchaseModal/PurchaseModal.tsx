import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dateLabelOf } from '@/formatting/labels'
import type { ManagedList } from '@/managers/api/managers'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { Select } from '@/ui/components/Select'

type Props = {
  opened: boolean
  list: ManagedList
  saving: boolean
  onClose: () => void
  onConfirm: (drawId: string | null) => void
}

export const PurchaseModal = ({ opened, list, saving, onClose, onConfirm }: Props) => {
  const { t } = useTranslation()
  const [pickedDrawId, setDrawId] = useState<string | null>(null)
  const drawId = list.draws.some(({ id }) => id === pickedDrawId)
    ? pickedDrawId
    : (list.draws[0]?.id ?? null)
  const name = list.owner.name

  const options = list.draws.map((draw) => ({
    value: draw.id,
    label: t('managers.purchase.drawOption', {
      name: draw.name,
      date: dateLabelOf(draw.eventDate),
    }),
  }))

  return (
    <Modal opened={opened} title={t('managers.purchase.title')} onClose={onClose}>
      {list.draws.length === 0 ? (
        t('managers.purchase.noDraw', { name })
      ) : (
        <>
          {t('managers.purchase.pickDraw', { name })}
          <Select
            label={t('managers.purchase.draw')}
            value={drawId}
            options={options}
            nothingFound={t('managers.purchase.nothingFound')}
            onChange={setDrawId}
          />
        </>
      )}
      <Modal.Actions>
        <Button variant="secondary" size="md" onClick={onClose}>
          {t('managers.purchase.cancel')}
        </Button>
        <Button size="md" loading={saving} onClick={() => onConfirm(drawId)}>
          {t('managers.purchase.confirm')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}
