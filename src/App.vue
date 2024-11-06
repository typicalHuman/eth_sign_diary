<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';
import { createAppKit, useAppKitProvider, useAppKitAccount } from '@reown/appkit/vue'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { APPKIT_METADATA, AVAILABLE_CHAINS, WALLET_CONNECT_APP_ID } from './utils/constants';
import { deriveAESKey } from './utils/aes';
import { clearAppkitLocalStorage } from './utils/utils';
// @ts-ignore
import HomeIcon from 'vue-material-design-icons/Home.vue';
import { useRouter } from 'vue-router';

// so a user would need to login each time and not cache would be used after reopenning the website
clearAppkitLocalStorage()

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()

const aesKey: any = ref(null);

const connected = ref(false)
const account = ref("")
const modal = createAppKit({
    adapters: [new EthersAdapter()],
    networks: AVAILABLE_CHAINS,
    metadata: APPKIT_METADATA,
    projectId: WALLET_CONNECT_APP_ID,
    features: {
        onramp: false,
        analytics: false
    },
    enableWalletConnect: true,
    themeMode: isDark.value ? "dark" : 'light'
})


async function getAesKey(signer: ethers.Signer) {
    if (aesKey.value) return aesKey.value
    return await deriveAESKey(signer)
}

function changeTheme() {
    toggleDark();
}

watch((isDark), () => {
    modal.setThemeMode(isDark.value ? "dark" : "light");
})

onMounted(() => {
    modal.subscribeAccount(async (state) => {
        if (state.isConnected && !account.value) {
            let { address } = useAppKitAccount()
            account.value = address || ""
            const { walletProvider } = useAppKitProvider('eip155')
            const provider = new BrowserProvider(walletProvider as any)
            const signer = await provider.getSigner()
            aesKey.value = await getAesKey(signer);
            connected.value = aesKey.value != null
        }
        else if (!state.isConnected && account.value) {
            account.value = ""
            aesKey.value = null
            connected.value = false
            router.replace({ path: "/" })
        }
    })
})


</script>

<template>
    <main class="dark:bg-black dark:text-white min-w-screen min-h-screen">
        <div class="px-3 py-2">
            <div class="flex justify-between items-center">
                <div class="flex flex-row gap-4 justify-center items-center">

                    <RouterLink to="/">
                        <HomeIcon :size="30" :fillColor="'#c9c9c9'" />
                    </RouterLink>
                    <w3m-account-button balance="false" />
                </div>

                <div class="flex items self-end items-center justify-end mr-5 ">
                    <button @click="changeTheme()">
                        <label class="relative cursor-pointer p-2" for="light-switch">
                            <svg class="dark:hidden" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path class="fill-slate-300"
                                    d="M7 0h2v2H7zM12.88 1.637l1.414 1.415-1.415 1.413-1.413-1.414zM14 7h2v2h-2zM12.95 14.433l-1.414-1.413 1.413-1.415 1.415 1.414zM7 14h2v2H7zM2.98 14.364l-1.413-1.415 1.414-1.414 1.414 1.415zM0 7h2v2H0zM3.05 1.706 4.463 3.12 3.05 4.535 1.636 3.12z" />
                                <path class="fill-slate-400" d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z" />
                            </svg>
                            <svg class="hidden dark:block" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path class="fill-slate-400"
                                    d="M6.2 1C3.2 1.8 1 4.6 1 7.9 1 11.8 4.2 15 8.1 15c3.3 0 6-2.2 6.9-5.2C9.7 11.2 4.8 6.3 6.2 1Z" />
                                <path class="fill-slate-500"
                                    d="M12.5 5a.625.625 0 0 1-.625-.625 1.252 1.252 0 0 0-1.25-1.25.625.625 0 1 1 0-1.25 1.252 1.252 0 0 0 1.25-1.25.625.625 0 1 1 1.25 0c.001.69.56 1.249 1.25 1.25a.625.625 0 1 1 0 1.25c-.69.001-1.249.56-1.25 1.25A.625.625 0 0 1 12.5 5Z" />
                            </svg>
                            <span class="sr-only">Switch to light / dark version</span>
                        </label>
                    </button>
                </div>
            </div>
            <div v-if="!connected" class="flex items-center justify-center w-screen">
                <button @click="modal.open()"
                    class="text-white bg-gradient-to-r bg-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-lg px-16 py-3.5 text-center me-2 mb-2">
                    Connect
                </button>
            </div>
            <router-view v-slot="{ Component }" v-else>
                <component :is="Component" :aesKey="aesKey" :address="account" />
            </router-view>
        </div>
    </main>
</template>