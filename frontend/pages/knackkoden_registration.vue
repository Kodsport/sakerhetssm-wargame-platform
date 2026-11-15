<template>

    <div>
        <h1>{{ $t('knackkoden.registerTitle') }}</h1>

        <p>
            {{ $t('knackkoden.loginSeparate') }}
        </p>
        <p>
            {{ $t('knackkoden.trouble') }}
        </p>
        <div class="col-4">

            <div class="form-group">
                <label for="class_name">{{ $t('knackkoden.className') }}</label>
                <input class="form-control" type="text" v-model="form.class_name" name="class_name" id="class_name">
            </div>
            <div class="form-group">
                <label for="school_name">{{ $t('knackkoden.schoolName') }}</label>
                <input class="form-control" type="text" v-model="form.school_name" name="school_name" id="school_name">
            </div>
            <div class="form-group">
                <label for="postal_code">{{ $t('knackkoden.schoolZip') }}</label>
                <input class="form-control" type="text" v-model="form.postal_code" name="postal_code" id="postal_code">
            </div>
            <div class="form-group">
                <label for="teacher_full_name">{{ $t('knackkoden.teacherName') }}</label>
                <input class="form-control" type="text" v-model="form.teacher_full_name" name="teacher_full_name"
                    id="teacher_full_name">
            </div>
            <div class="form-group">
                <label for="teacher_email">{{ $t('knackkoden.teacherEmail') }}</label>
                <input class="form-control" type="text" v-model="form.teacher_email" name="teacher_email"
                    id="teacher_email">
            </div>
            <div class="form-group">
                <label for="teacher_phonenr">{{ $t('knackkoden.teacherPhone') }}</label>
                <input class="form-control" type="text" v-model="form.teacher_phonenr" name="teacher_phonenr"
                    id="teacher_phonenr">
            </div>


            <button class="btn btn-primary mt-2" @click="register">{{ $t('knackkoden.registerClass') }}</button>
        </div>

        <div class="alert alert-success mt-3" v-if="password != ''">
            {{ $t('knackkoden.classPasswordIs') }} {{ password }}
            <br>
            {{ $t('knackkoden.saveIt') }}
        </div>
    </div>
</template>

<script setup lang="ts">
const http = useHttp()

const form = ref({
    class_name: "",
    school_name: "",
    postal_code: "",
    teacher_full_name: "",
    teacher_email: "",
    teacher_phonenr: "",
})

const password = ref("")

async function register() {
    const resp = await http(`/knack_koden_register_class`, {
        method: 'POST',
        body: form.value,
    });

    password.value = resp.password

}

</script>