import { useTranslation } from 'react-i18next'
import { Loader } from '@/ui/components/Loader'
import classes from './PendingScreen.module.css'

export const PendingScreen = () => {
  const { t } = useTranslation()

  return (
    <div className={classes.root}>
      <Loader label={t('shell.pending.label')} />
    </div>
  )
}
