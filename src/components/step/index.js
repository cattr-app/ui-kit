import Step from '../steps/src/step.vue'

Step.install = app => {
  app.component(Step.name, Step)
}

export default Step
