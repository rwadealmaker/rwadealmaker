<template>
  <section class="kyc-page container">
    <!-- 顶部 -->
    <header class="topbar">
      <button class="back" @click="goProfile">&larr; {{ t('kyc.back') }}</button>
      <h1 class="title">{{ t('kyc.title') }}</h1>
      <button class="btn light danger" @click="cancelKYC">{{ t('kyc.cancelVerification') }}</button>
    </header>

    <!-- 进度 -->
    <ol class="steps">
      <li :class="{active: step===1, done: step>1}">{{ t('kyc.step1') }}</li>
      <!-- <li :class="{active: step===2, done: step>2}">2. Document</li> -->
      <li :class="{active: step===3, done: step>3}">{{ t('kyc.step2') }}</li>
      <li :class="{active: step===4, done: step>4}">{{ t('kyc.step3') }}</li>
    </ol>

    <!-- Step 1：上传证件并自动识别（OCR 占位） -->
    <div v-if="step===1" class="modal">
      <div class="card">
        <h2>{{ t('kyc.uploadIdTitle') }}</h2>
        <form @submit.prevent="goDoc">
          <div class="grid">
            <label>{{ t('kyc.uploadFront') }} <input type="file" accept="image/*" @change="onFile($event,'front')" required /></label>
            <label>{{ t('kyc.uploadBack') }} <input type="file" accept="image/*" @change="onFile($event,'back')" /></label>
            <label>{{ t('kyc.issuingCountry') }}
              <select v-model="form.country" required>
                <option value="" disabled>{{ t('kyc.selectCountry') }}</option>
                <option value="AU">Australia</option>
                <option value="US">United States</option>
                <option value="AR">Argentina</option>
              </select>
            </label>
            <label>{{ t('kyc.idType') }}
              <select v-model="form.docType" required>
                <option value="" disabled>{{ t('kyc.selectIdType') }}</option>
                <option value="passport">{{ t('kyc.passport') }}</option>
                <option value="driver">{{ t('kyc.driverLicense') }}</option>
                <option value="idcard">{{ t('kyc.idCard') }}</option>
                <option value="residence">{{ t('kyc.residencePermit') }}</option>
              </select>
            </label>
          </div>

          <div class="actions" style="justify-content: flex-start; gap: 10px;">
            <button type="button" class="btn light" @click="extractFromId" :disabled="!form.fileFront">{{ t('kyc.autoRead') }}</button>
            <small class="hint">{{ t('kyc.autoReadHint') }}</small>
          </div>

          <div class="grid" style="margin-top:12px;">
            <label>{{ t('kyc.firstName') }} <input v-model.trim="form.firstName" required readonly /></label>
            <label>{{ t('kyc.lastName') }}  <input v-model.trim="form.lastName" required readonly /></label>
            <label>{{ t('kyc.dateOfBirth') }}  <input v-model.trim="form.dob" required readonly /></label>
            <label>{{ t('kyc.idNumber') }}  <input v-model.trim="form.docNumber" readonly /></label>
          </div>

          <div class="actions">
            <button type="button" class="btn light" @click="cancelKYC">{{ t('kyc.cancel') }}</button>
            <button type="submit" class="btn orange" :disabled="!readyExtract">{{ t('kyc.continue') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Step 2：活体检测（占位，接第三方时替换） -->
     <div v-if="step===3" class="modal">
      <div class="card">
        <h2>{{ t('kyc.livenessTitle') }}</h2>
        <p>{{ t('kyc.livenessDescription') }}</p>
        <!-- <div class="face-ring"></div> -->

        <div class="camera-block">
          <video v-if="cameraEnabled" ref="videoEl" autoplay playsinline class="cam-preview"></video>
          <button v-else class="btn orange" @click="enableCamera">{{ t('kyc.enableCamera') }}</button>
          <p v-if="camError" class="cam-error">{{ camError }}</p>
          
          <!-- 检测状态显示 -->
          <div v-if="livenessDetecting" class="liveness-status">
            <div class="detection-spinner"></div>
            <p class="detection-text">{{ livenessStatus }}</p>
          </div>
        </div>
        <small class="hint">{{ t('kyc.livenessHint') }}</small>
        <div class="actions">
          <button type="button" class="btn light" @click="prev">{{ t('kyc.back') }}</button>
          <button v-if="!cameraEnabled" class="btn light danger" @click="cancelLiveness">{{ t('kyc.cancelLiveness') }}</button>
        </div>
      </div>
    </div> 

    <!-- Step 3：完成 -->
    <div v-if="step===4" class="modal">
      <div class="card success">
        <div class="bigcheck">✓</div>
        <h2>{{ t('kyc.verifiedTitle') }}</h2>
        <p>{{ t('kyc.verifiedDescription') }}</p>
        <div class="actions">
          <button class="btn orange" @click="goProfile">{{ t('kyc.backToProfile') }}</button>
        </div>
      </div>
    </div>

    <!-- 白名单申请资格弹窗 -->
    <div v-if="showWhitelistEligibility" class="modal">
      <div class="card">
        <div class="success-icon">🎉</div>
        <h2 style="color: #16a34a;">{{ t('kyc.congratulations') }}</h2>
        <p style="font-weight: bold; color:#000;">{{ t('kyc.kycCompleted') }}</p>
        <p style="font-weight: bold; color:#000;">{{ t('kyc.eligibleForWhitelist') }}</p>
        <div class="actions">
          <button class="btn light" @click="goProfile">{{ t('kyc.maybeLater') }}</button>
          <button class="btn orange" @click="applyWhitelist">{{ t('kyc.applyForWhitelist') }}</button>
        </div>
      </div>
    </div>

    <!-- 白名单申请处理弹窗 -->
    <div v-if="showWhitelistApplication" class="modal">
      <div class="card">
        <div class="loading-icon">
          <div class="spinner"></div>
        </div>
        <h2>{{ t('kyc.applyingWhitelist') }}</h2>
        <p>{{ t('kyc.applyingWhitelistDescription') }}</p>
        <div class="loading-text">{{ loadingMessage }}</div>
      </div>
    </div>

    <!-- 白名单申请成功弹窗 -->
    <div v-if="showWhitelistSuccess" class="modal">
      <div class="card success">
        <div class="bigcheck">✓</div>
        <h2>{{ t('kyc.welcomeToWhitelist') }}</h2>
        <p>{{ t('kyc.whitelistSuccess') }}</p>
        <p><strong>{{ t('kyc.canSubscribe') }}</strong></p>
        <!-- <div class="actions">
          <button class="btn orange" @click="goToProjects">{{ t('kyc.goToProjects') }}</button>
          <!-- <button class="btn light" @click="goProfile">{{ t('kyc.backToProfile') }}</button> -->
        <!-- </div> -->
      </div>
    </div>

    <!-- KYC取消确认弹窗 -->
    <div v-if="showCancelConfirm" class="modal">
      <div class="card">
        <div class="warning-icon">⚠️</div>
        <h2>{{ t('kyc.cancelKycTitle') }}</h2>
        <p>{{ t('kyc.cancelKycWarning') }}</p>
        <p><strong>{{ t('kyc.cancelKycConfirm') }}</strong></p>
        <div class="actions">
          <button class="btn light" @click="hideCancelConfirm">{{ t('kyc.continueKyc') }}</button>
          <button class="btn danger" @click="confirmCancelKYC">{{ t('kyc.yesCancelKyc') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { setKycStatus, KYC_STATUS } from '@/service/kycService'
import { unifiedContractService as contractService } from '@/service/unifiedContractService'
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'KycServicePage',
  data(){
    return {
      step: 1,
      form: {
        firstName:'', lastName:'', dob:'', email:'', phone:'',
        country:'', docType:'', docNumber:'',
        fileFront:null, fileBack:null,
      },
      cameraEnabled:false,
      camError:'',
      // 活体检测状态
      livenessDetecting: false,
      livenessStatus: '正在检测...',
      // 白名单相关状态
      showWhitelistEligibility: false,
      showWhitelistApplication: false,
      showWhitelistSuccess: false,
      loadingMessage: 'Processing...',
      // 取消确认状态
      showCancelConfirm: false,
    }
  },
  computed:{
    // 驾照/ID卡一般需要反面
    needsBack(){ return this.form.docType==='driver' || this.form.docType==='idcard' }
    ,readyExtract(){ return !!(this.form.firstName && this.form.lastName && this.form.dob) }
  },
  methods:{
    t(key) {
      const { t } = useLanguage()
      return t(key)
    },
    goProfile(){ this.$router.push('/profile') },
    prev(){ this.step = Math.max(1, this.step - 1) },
    
    // 显示取消确认弹窗
    cancelKYC(){ 
      this.showCancelConfirm = true 
    },
    
    // 隐藏取消确认弹窗
    hideCancelConfirm(){
      this.showCancelConfirm = false
    },
    
    // 确认取消KYC
    confirmCancelKYC(){
      this.showCancelConfirm = false
      // 重置KYC状态
      setKycStatus(KYC_STATUS.UNVERIFIED)
      // 返回个人资料页面
      this.$router.push('/profile')
    },

    goDoc(){
      // Step1 完成后直接进入活体（原 Step2 已移除）
      this.step = 3
    },
    onFile(e, pos){
      const f = e.target.files?.[0]
      if (!f) return
      if (pos==='front') this.form.fileFront = f
      else this.form.fileBack = f
    },
    async extractFromId(){
      // 占位：实际应上传至后端/第三方 OCR，解析并回填
      // 这里做一个本地 demo：根据文件名简单模拟解析
      try{
        const name = (this.form.fileFront?.name || '').toLowerCase()
        if (name.includes('john')) this.form.firstName = 'John'
        if (name.includes('doe')) this.form.lastName = 'Doe'
        if (name.match(/1990|90/)) this.form.dob = '1990-01-01'
        if (!this.form.firstName) this.form.firstName = 'GivenName'
        if (!this.form.lastName) this.form.lastName = 'FamilyName'
        if (!this.form.dob) this.form.dob = '1990-01-01'
      }catch{}
    },
    // goLiveness 删除：直接由 goDoc 切换到 Step3
    complete(){
      // 第三方成功回调时应写入最终状态；此处做 demo：直接标记为 VERIFIED
      setKycStatus(KYC_STATUS.VERIFIED)
      this.step = 4
      
      // KYC验证完成后禁用镜头功能
      this.disableCamera()
      
      // 延迟显示白名单申请资格弹窗
      setTimeout(() => {
        this.showWhitelistEligibility = true
      }, 1500) // 1.5秒后显示
    },
    async enableCamera(){
      this.camError = ''
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video:true })
        this.cameraEnabled = true
        this.$nextTick(()=>{ if(this.$refs.videoEl) this.$refs.videoEl.srcObject = stream })
        
        // 开始自动检测流程
        this.startLivenessDetection()
      }catch(e){
        this.camError = '无法访问摄像头，请检查浏览器权限设置。'
      }
    },
    
    // 开始活体检测
    async startLivenessDetection() {
      this.livenessDetecting = true
      this.livenessStatus = '正在检测...'
      
      // 3秒后显示验证成功
      setTimeout(() => {
        this.livenessStatus = '验证成功，进入下一步'
        
        // 再延迟1秒后自动完成验证
        setTimeout(() => {
          this.complete()
        }, 1000)
      }, 3000)
    },
    
    // 取消活体检测
    cancelLiveness() {
      this.cameraEnabled = false
      this.livenessDetecting = false
      this.livenessStatus = '正在检测...'
      // 停止摄像头流
      if (this.$refs.videoEl && this.$refs.videoEl.srcObject) {
        const tracks = this.$refs.videoEl.srcObject.getTracks()
        tracks.forEach(track => track.stop())
        this.$refs.videoEl.srcObject = null
      }
      // 返回上一步
      this.prev()
    },
    
    // 禁用镜头功能
    disableCamera() {
      console.log('🔒 KYC验证完成，禁用镜头功能')
      this.cameraEnabled = false
      this.livenessDetecting = false
      this.livenessStatus = '验证已完成'
      
      // 停止摄像头流
      if (this.$refs.videoEl && this.$refs.videoEl.srcObject) {
        const tracks = this.$refs.videoEl.srcObject.getTracks()
        tracks.forEach(track => {
          track.stop()
          console.log('📹 摄像头流已停止')
        })
        this.$refs.videoEl.srcObject = null
      }
      
      // 清除摄像头错误信息
      this.camError = ''
      
      console.log('✅ 镜头功能已完全禁用')
    },
    
    // 白名单申请相关方法
    async applyWhitelist() {
      this.showWhitelistEligibility = false
      this.showWhitelistApplication = true
      
      try {
        // 设置加载消息
        this.loadingMessage = 'Connecting to blockchain...'
        await this.delay(1000)
        
        this.loadingMessage = 'Submitting whitelist application...'
        await this.delay(1000)
        
        this.loadingMessage = 'Processing transaction...'
        await this.delay(1500)
        
        // 调用智能合约接口
        const result = await this.submitWhitelistToContract()
        
        if (result.success) {
          this.loadingMessage = 'Whitelist application successful!'
          await this.delay(1000)
          
          this.showWhitelistApplication = false
          this.showWhitelistSuccess = true
        } else {
          throw new Error(result.error || 'Whitelist application failed')
        }
      } catch (error) {
        console.error('Whitelist application error:', error)
        this.loadingMessage = 'Application failed. Please try again.'
        await this.delay(2000)
        
        // 返回白名单申请资格弹窗
        this.showWhitelistApplication = false
        this.showWhitelistEligibility = true
      }
    },
    
    // 智能合约对接接口 - 使用合约服务
    async submitWhitelistToContract() {
      try {
        console.log('Calling whitelist contract...')
        
        // 准备KYC数据
        const kycData = {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          dob: this.form.dob,
          country: this.form.country,
          docType: this.form.docType,
          docNumber: this.form.docNumber
        }
        
        // 调用合约服务申请KYC验证
        const result = await contractService.applyForKYC(kycData)
        
        if (result.success) {
          console.log('Whitelist application successful:', result.transactionHash)
          return result
        } else {
          throw new Error(result.error || 'Whitelist application failed')
        }
        
      } catch (error) {
        console.error('Contract call failed:', error)
        return { success: false, error: error.message }
      }
    },
    
    // 辅助方法：延迟
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    // 导航到项目页面
    goToProjects() {
      this.showWhitelistSuccess = false
      this.$router.push('/listedprojects')
    }
  }
}
</script>

<style scoped>
.container { max-width: 920px; margin: 0 auto; padding: 20px 16px 64px; }
.topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
.back { border:0; background:transparent; cursor:pointer; color:#334155; }
.title { font-size:20px; font-weight:700; }
.steps { display:flex; gap:12px; list-style:none; padding:12px 0 24px; margin:0; flex-wrap:wrap; }
.steps li { padding:6px 10px; border-radius:999px; background:#f1f5f9; color:#334155; font-size:12px; }
.steps li.active { background:#dbeafe; color:#1e40af; }
.steps li.done { background:#e8f7ec; color:#17683a; }

.modal { position:fixed; inset:0; background:rgba(15,23,42,.45); display:grid; place-items:center; z-index:50; }
.card { width:min(720px, 92vw); background:#fff; border-radius:16px; padding:20px; box-shadow:0 20px 60px rgba(15,23,42,.2); }
.card.success { text-align:center; padding:40px 24px; }
.bigcheck { font-size:52px; color:#16a34a; margin-bottom:8px; }
.grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
.grid label { display:flex; flex-direction:column; gap:6px; font-size:14px; color:#334155; }
.grid input, .grid select { height:40px; border:1px solid #e2e8f0; border-radius:8px; padding:0 12px; }
.actions { display:flex; justify-content:flex-end; gap:10px; margin-top:16px; }
.btn { border:1px solid transparent; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:600; }
.btn.orange { background:#ea7a2e; color:#fff; }
.btn.light { background:#f1f5f9; color:#0f172a; border-color:#e2e8f0; }
.face-ring { width:220px; height:220px; border-radius:999px; margin:18px auto; border:10px solid #e2e8f0; background:#eee; }
.hint { display:block; margin-top:8px; color:#64748b; }

/* 白名单相关样式 */
.success-icon { 
  font-size: 48px; 
  margin-bottom: 16px; 
  text-align: center; 
}

.loading-icon { 
  text-align: center; 
  margin-bottom: 16px; 
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #ea7a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  text-align: center;
  color: #64748b;
  font-size: 14px;
  margin-top: 8px;
  font-style: italic;
}

.card h2 {
  text-align: center;
  margin-bottom: 16px;
}

.card p {
  text-align: center;
  margin-bottom: 8px;
  line-height: 1.5;
}

.card strong {
  color: #ea7a2e;
}

/* 取消确认弹窗样式 */
.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
  text-align: center;
}

.btn.danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn.danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

/* 活体检测状态样式 */
.liveness-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  z-index: 10;
}

.detection-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ea7a2e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.detection-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.camera-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.cam-preview {
  width: 100%;
  max-width: 400px;
  height: 300px;
  background: #000;
  border-radius: 12px;
  object-fit: cover;
}

.cam-error {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}
</style>
