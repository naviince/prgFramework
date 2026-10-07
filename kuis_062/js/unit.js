$(function () {
    'use strict';

    createCrud({
        resource: 'unit',
        idField: 'id',
        entity: 'Unit',
        numeric: ['harga/jam', 'jumlah'],
        columns: [
            { title: 'ID', data: 'id', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            { title: 'Nama Unit', data: 'nama_unit', render: Util.esc },
            {
                title: 'Tipe Console', data: 'tipe_ps', render: function (d) {
                    return Util.badge(d, d === 'PS3' ? 'success' : (d === 'PS4' ? 'warning' : 'danger', 'secondary', d === 'PS5' ? 'primary' : 'secondary'));
                }
            },
            { title: 'Harga/Jam', data: 'harga_per_jam', className: 'text-right', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            {
                title: 'Status', data: 'status', render: function (d) {
                    return Util.badge(d, d === 'Tersedia' ? 'success' : 'secondary');
                }
            }
        ],
        label: function (row) { return row.nama_unit || 'unit ini'; }
    });
});
