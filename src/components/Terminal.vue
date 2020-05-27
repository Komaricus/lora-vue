<template>
  <div>
    <div id="terminal" class="terminal-output" :style="fullscreen ? {height: '835px'} : styleObject">
      <div v-html="output"></div>
      <div v-if="loading" class="loading">
        <i class="el-icon-loading"></i>
        <br>
        <span>Loading...</span>
      </div>
      <label style="color: #42b983">
        &gt;
        <input v-model="command" v-on:keyup.enter="runCommand" class="terminal-input"/>
      </label>
    </div>
    <el-button v-if="!fullscreen" type="default" size="medium" @click="openTerminal" style="margin-top: 10px"
               icon="mdi mdi-open-in-new">
      Open in new tab
    </el-button>
  </div>
</template>

<script>
  import axios from "axios";
  import config from "../config";

  export default {
    name: "terminal",
    props: {
      device: {
        type: Object
      },
      fullscreen: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        command: '',
        loading: false,
        output: '',
        styleObject: {
          maxWidth: '600px',
          height: '400px'
        }
      }
    },
    created() {
      if (localStorage.getItem('output')) {
        this.output = localStorage.getItem('output');
        localStorage.removeItem('output');
        setTimeout(() => {
          this.scroll();
        }, 20);
      }
    },
    methods: {
      openTerminal() {
        localStorage.setItem('output', this.output);
        window.open(`${window.location.origin}/terminal/${this.device.id}`)
      },
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      getNodeNameByDpid(dpid) {
        if (dpid.includes('host')) {
          return 'h' + Number(dpid.replace('host', ''));
        } else {
          return 's' + this.dpidToInt(dpid);
        }
      },
      scroll() {
        const objDiv = document.getElementById("terminal");
        objDiv.scrollTop = 99999999;
      },
      async runCommand() {
        if (this.loading) return;

        const command = this.command;
        this.command = '';

        this.output += `<span style="color: #42b983;">&gt; ${command}</span>`;
        setTimeout(() => {
          this.scroll();
        }, 20);

        this.loading = true;
        await axios.post(`${config.api}/nodes/${this.getNodeNameByDpid(this.device.id)}/cmd`, command, {
            headers: {'Content-Type': 'text/plain'},
            params: {
              timeout: config.CMD_TIMEOUT
            }
          })
          .then(response => {
            this.output += `<br>${response.data}`;
            this.$store.commit('notify', {
              title: 'Command completed',
              type: 'success',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
          .catch(error => {
            console.error(error);
            this.$store.commit('notify', {
              title: 'Error',
              message: 'Something went wrong',
              type: 'error',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false;
              this.scroll();
            }, 100)
          });
      }
    },
    watch: {
      device() {
        this.command = '';
        this.loading = false;
        this.output = '';
      },
    }
  }
</script>

<style scoped lang="scss">
  @import "../assets/styles/colors";

  .terminal-output {
    display: block;
    white-space: normal;
    background-color: $primary;
    color: white;
    padding: 10px;
    font-size: 16px;
    overflow-y: auto;
  }

  .terminal-input {
    background-color: $primary;
    color: #42b983;
    border: none;
    outline: 0;
    font-size: 16px;
    width: calc(100% - 15.11px);
  }

  .loading {
    margin: 0 auto;
    padding: 20px 0;
    text-align: center;
    background-color: $primary;
    color: white;
  }
</style>