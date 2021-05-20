import { inject, onBeforeUnmount, ref } from 'vue'
import { useI18n, initI18nButtonMsgsOnce } from '@dcloudio/uni-core'
import { defineBuiltInComponent } from '../../helpers/component'
import { useHover } from '../../helpers/useHover'
import { useBooleanAttr } from '../../helpers/useBooleanAttr'
import { withWebEvent } from '../../helpers/useEvent'
import { UniFormCtx, uniFormKey } from '../form'
import { uniLabelKey, UniLabelCtx } from '../label'
import { useListeners } from '../../helpers/useListeners'

export default /*#__PURE__*/ defineBuiltInComponent({
  name: 'Button',
  props: {
    id: {
      type: String,
      default: '',
    },
    hoverClass: {
      type: String,
      default: 'button-hover',
    },
    hoverStartTime: {
      type: [Number, String],
      default: 20,
    },
    hoverStayTime: {
      type: [Number, String],
      default: 70,
    },
    hoverStopPropagation: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: [Boolean, String],
      default: false,
    },
    formType: {
      type: String,
      default: '',
    },
    openType: {
      type: String,
      default: '',
    },
    loading: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots }) {
    const rootRef = ref<HTMLElement | null>(null)
    if (__PLATFORM__ === 'app') {
      initI18nButtonMsgsOnce()
    }
    const uniForm = inject<UniFormCtx>(
      uniFormKey,
      false as unknown as UniFormCtx
    )
    const { hovering, binding } = useHover(props)
    const { t } = useI18n()
    const onClick = withWebEvent((e: Event, isLabelClick: boolean) => {
      if (props.disabled) {
        return e.stopImmediatePropagation()
      }
      if (isLabelClick) {
        rootRef.value!.click()
      }
      const formType = props.formType
      if (formType) {
        if (!uniForm) {
          return
        }
        if (formType === 'submit') {
          uniForm.submit()
        } else if (formType === 'reset') {
          uniForm.reset()
        }
        return
      }
      if (__PLATFORM__ === 'app' && props.openType === 'feedback') {
        openFeedback(
          t('uni.button.feedback.title'),
          t('uni.button.feedback.send')
        )
      }
    })

    const uniLabel = inject<UniLabelCtx>(
      uniLabelKey,
      false as unknown as UniLabelCtx
    )
    if (uniLabel) {
      uniLabel.addHandler(onClick)
      onBeforeUnmount(() => {
        uniLabel.removeHandler(onClick)
      })
    }
    useListeners(props, { 'label-click': onClick })

    return () => {
      const hoverClass = props.hoverClass
      const booleanAttrs = useBooleanAttr(props, 'disabled')
      const loadingAttrs = useBooleanAttr(props, 'loading')
      const hasHoverClass = hoverClass && hoverClass !== 'none'

      return (
        <uni-button
          ref={rootRef}
          onClick={onClick}
          class={hasHoverClass && hovering.value ? hoverClass : ''}
          {...(hasHoverClass && binding)}
          {...booleanAttrs}
          {...loadingAttrs}
        >
          {slots.default && slots.default()}
        </uni-button>
      )
    }
  },
})

function openFeedback(titleText: string, sendText: string) {
  const feedback = plus.webview.create(
    // @ts-ignore
    'https://service.dcloud.net.cn/uniapp/feedback.html',
    'feedback',
    {
      titleNView: {
        titleText,
        autoBackButton: true,
        backgroundColor: '#F7F7F7',
        titleColor: '#007aff',
        buttons: [
          {
            text: sendText,
            color: '#007aff',
            fontSize: '16px',
            fontWeight: 'bold',
            onclick: function () {
              feedback.evalJS(
                'typeof mui !== "undefined" && mui.trigger(document.getElementById("submit"),"tap")'
              )
            },
          },
        ],
      },
    }
  )
  feedback.show('slide-in-right')
}
