$(function () {
    'use strict';

    createCrud({
        resource: 'mahasiswa',
        idField: 'id',
        entity: 'Mahasiswa',
        numeric: ['angkatan'],
        columns: [
            { title: 'ID', data: 'id', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            { title: 'NIM', data: 'nim', render: Util.esc },
            { title: 'Nama', data: 'nama', render: Util.esc },
            { title: 'Jurusan', data: 'jurusan', render: Util.esc },
            { title: 'Angkatan', data: 'angkatan', render: Util.esc },
            { title: 'Email', data: 'email', render: Util.esc },
            { title: 'Telepon', data: 'telepon', render: Util.esc }
        ],
        label: function (row) { return row.nama ? row.nama + ' (' + row.nim + ')' : 'mahasiswa ini'; }
    });
});
