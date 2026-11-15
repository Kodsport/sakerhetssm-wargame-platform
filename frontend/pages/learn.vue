<template>
    <div class="container">
        <div class="mc-panel">
            <h1 class="text-primary">{{ $t('learn.heading') }}</h1>
            <p>{{ $t('learn.intro') }}</p>
            <h3 class="text-primary">{{ $t('learn.ssmLectures') }}</h3>
            <p>{{ $t('learn.ssmLecturesText') }}</p>
            <ul>
                <li><a href="https://www.youtube.com/watch?v=jYCN6QyZeeQ">Intro till assembly</a></li>
                <li><a href="https://www.youtube.com/watch?v=ymlYSeoF6j4">Intro till reverse engineering</a></li>
                <li><a href="https://www.youtube.com/watch?v=IFjty3suKXg">Intro till pwn</a></li>
            </ul>
            <h3 class="text-primary">{{ $t('learn.youtube') }}</h3>
            <ul>
                <li>
                    <a href="https://www.youtube.com/channel/UClcE-kVhqyiHCcjYwcpfj9w">LiveOverflow</a>: {{ $t('learn.liveOverflowText') }}
                    <ul>
                        <li>
                            <a href="https://www.youtube.com/watch?v=2TofunAI6fU">
                                The Secret step-by-step Guide to learn Hacking
                            </a>
                        </li>
                        <li>
                            <a href="https://www.youtube.com/watch?v=8ev9ZX9J45A">
                                What is CTF? An introduction to security Capture The Flag competitions
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="https://www.youtube.com/user/GynvaelEN">Gynvael</a>: {{ $t('learn.gynvaelText') }}
                </li>
                <li>
                    <a href="https://www.youtube.com/user/ZetaTwo">ZetaTwo</a>:
                    {{ $t('learn.zetaTwoText') }}
                    <a href="https://www.youtube.com/playlist?list=PLzzz0pYwY0M0u5daM96-QvHagA5v7FhLP">{{ $t('learn.here') }}</a>
                    {{ $t('learn.zetaTwoMid') }}
                </li>
            </ul>
            <h3 class="text-primary">{{ $t('learn.ctfWargames') }}</h3>
            <p>{{ $t('learn.ctfWargamesText') }}
            </p>
            <ul>
                <li>
                    <nuxt-link to="/challenges">Säkerhets-SM</nuxt-link>
                </li>
                <li><a href="https://picoctf.com/">PicoCTF</a></li>
                <li><a href="https://pwn.college/">pwn.college</a></li>
                <li><a href="https://cryptohack.org/">Cryptohack</a></li>
            </ul>
            <h3 class="text-primary">{{ $t('learn.collections') }}</h3>
            <ul>
                <li><a href="https://gist.github.com/ZetaTwo/40976c9ed8b9abb81e44c872b3a68551">ZetaTwo - tools.md</a>
                </li>
                <li><a href="https://pequalsnp-team.github.io/cheatsheet/steganography-101">Steganography 101</a></li>
                <li><a href="https://github.com/InfoSecIITR/reading-material">InfoSecIITR - Reading material</a></li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const url = useRequestURL()
useHead({
    title: computed(() => t('learn.title')),
    link: [
        {
            rel: 'canonical',
            href: `${url.protocol}//${url.host}/learn`,
        },
    ]
})
</script>
