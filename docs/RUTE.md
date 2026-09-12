# Daftar Rute MR Kabar

Dihasilkan otomatis dari pendaftaran rute (2026-09-13, 374 rute). Jangan disunting tangan; jalankan `php artisan rute:dokumen` untuk memperbarui.

| Metode | URI | Nama | Penangan | Middleware |
|---|---|---|---|---|
| GET | `/` | home | `Closure` | web |
| GET | `audit-logs` | audit-logs.index | `AuditLogController@index` | web, auth, menu.permission |
| GET | `backup` | backup.index | `BackupController@index` | web, auth, menu.permission |
| DELETE | `backup/delete/{file}` | backup.delete | `BackupController@delete` | web, auth, menu.permission |
| GET | `backup/download/{file}` | backup.download | `BackupController@download` | web, auth, menu.permission |
| GET | `backup/drive/callback` | backup.drive.callback | `CadanganDriveController@callback` | web, auth, menu.permission |
| POST | `backup/drive/kredensial` | backup.drive.kredensial | `CadanganDriveController@simpanKredensial` | web, auth, menu.permission |
| POST | `backup/drive/putus` | backup.drive.putus | `CadanganDriveController@putus` | web, auth, menu.permission |
| GET | `backup/drive/tautkan` | backup.drive.tautkan | `CadanganDriveController@tautkan` | web, auth, menu.permission |
| POST | `backup/drive/unggah` | backup.drive.unggah | `CadanganDriveController@unggah` | web, auth, menu.permission |
| DELETE | `backup/drive/{idBerkas}` | backup.drive.hapus | `CadanganDriveController@hapus` | web, auth, menu.permission |
| POST | `backup/drive/{idBerkas}/pulihkan` | backup.drive.pulihkan | `CadanganDriveController@pulihkan` | web, auth, menu.permission |
| GET | `backup/excel` | backup.excel.index | `RiskExcelController@index` | web, auth, menu.permission |
| GET | `backup/excel/export` | backup.excel.export | `RiskExcelController@export` | web, auth, menu.permission |
| POST | `backup/excel/import` | backup.excel.import | `RiskExcelController@import` | web, auth, menu.permission |
| POST | `backup/excel/import-requests/{importRequest}/approve` | backup.excel.import-requests.approve | `RiskExcelController@approve` | web, auth, menu.permission |
| POST | `backup/excel/import-requests/{importRequest}/reject` | backup.excel.import-requests.reject | `RiskExcelController@reject` | web, auth, menu.permission |
| GET | `backup/excel/template` | backup.excel.template | `RiskExcelController@template` | web, auth, menu.permission |
| POST | `backup/git-checkout-tag` | backup.git-checkout-tag | `BackupController@checkoutTag` | web, auth, menu.permission |
| GET | `backup/git-periksa` | backup.git-periksa | `BackupController@gitPeriksa` | web, auth, menu.permission |
| POST | `backup/git-pull` | backup.git-pull | `BackupController@gitPull` | web, auth, menu.permission |
| POST | `backup/git-push` | backup.git-push | `BackupController@gitPush` | web, auth, menu.permission |
| POST | `backup/git-sync-toggle` | backup.git-sync-toggle | `BackupController@toggleGitSync` | web, auth, menu.permission |
| POST | `backup/import` | backup.import | `BackupController@importDatabase` | web, auth, menu.permission |
| POST | `backup/kesehatan` | backup.kesehatan | `BackupController@periksaKesehatan` | web, auth, menu.permission |
| POST | `backup/run` | backup.run | `BackupController@run` | web, auth, menu.permission |
| POST | `backup/versi` | backup.versi.tandai | `BackupController@tandaiVersi` | web, auth, menu.permission |
| POST | `backup/versi/{tag}/pulihkan` | backup.versi.pulihkan | `BackupController@pulihkanVersi` | web, auth, menu.permission |
| GET | `backup/versi/{tag}/unduh` | backup.versi.unduh | `BackupController@unduhVersi` | web, auth, menu.permission |
| DELETE | `cee/1a` | cee.form1a.destroy | `CeeFormController@destroy1a` | web, auth, menu.permission |
| GET | `cee/1a` | cee.form1a | `CeeFormController@form1a` | web, auth, menu.permission |
| POST | `cee/1a` | cee.form1a.store | `CeeFormController@store1a` | web, auth, menu.permission |
| GET | `cee/1a/responden` | cee.form1a.responden | `CeeFormController@jawabanResponden1a` | web, auth, menu.permission |
| GET | `cee/1b` | cee.form1b | `CeeFormController@form1b` | web, auth, menu.permission |
| POST | `cee/1b` | cee.form1b.store | `CeeFormController@store1b` | web, auth, menu.permission |
| DELETE | `cee/1b/{kelemahan}` | cee.form1b.destroy | `CeeFormController@destroy1b` | web, auth, menu.permission |
| PUT | `cee/1b/{kelemahan}` | cee.form1b.update | `CeeFormController@update1b` | web, auth, menu.permission |
| GET | `cee/1c` | cee.form1c | `CeeFormController@form1c` | web, auth, menu.permission |
| POST | `cee/1c` | cee.form1c.store | `CeeFormController@store1c` | web, auth, menu.permission |
| DELETE | `cee/1c/{simpulan}` | cee.form1c.destroy | `CeeFormController@destroy1c` | web, auth, menu.permission |
| PUT | `cee/1c/{simpulan}` | cee.form1c.update | `CeeFormController@update1c` | web, auth, menu.permission |
| GET | `cee/1d` | cee.form1d | `CeeFormController@form1d` | web, auth, menu.permission |
| POST | `cee/1d` | cee.form1d.store | `CeeFormController@store1d` | web, auth, menu.permission |
| DELETE | `cee/1d/{rtp}` | cee.form1d.destroy | `CeeFormController@destroy1d` | web, auth, menu.permission |
| PUT | `cee/1d/{rtp}` | cee.form1d.update | `CeeFormController@update1d` | web, auth, menu.permission |
| GET | `cee/pertanyaan` | cee.pertanyaan.index | `CeePertanyaanController@index` | web, auth, menu.permission |
| POST | `cee/pertanyaan` | cee.pertanyaan.store | `CeePertanyaanController@store` | web, auth, menu.permission |
| DELETE | `cee/pertanyaan/{pertanyaan}` | cee.pertanyaan.destroy | `CeePertanyaanController@destroy` | web, auth, menu.permission |
| PUT | `cee/pertanyaan/{pertanyaan}` | cee.pertanyaan.update | `CeePertanyaanController@update` | web, auth, menu.permission |
| GET | `cetak/cee/1a` | cetak.cee.1a | `CetakCeeController@cetak1a` | web, auth, menu.permission |
| GET | `cetak/cee/1a/pdf` | cetak.cee.1a.pdf | `CetakCeeController@pdf1a` | web, auth, menu.permission |
| GET | `cetak/cee/1b` | cetak.cee.1b | `CetakCeeController@cetak1b` | web, auth, menu.permission |
| GET | `cetak/cee/1b/pdf` | cetak.cee.1b.pdf | `CetakCeeController@pdf1b` | web, auth, menu.permission |
| GET | `cetak/cee/1c` | cetak.cee.1c | `CetakCeeController@cetak1c` | web, auth, menu.permission |
| GET | `cetak/cee/1c/pdf` | cetak.cee.1c.pdf | `CetakCeeController@pdf1c` | web, auth, menu.permission |
| GET | `cetak/laporan/1` | cetak.laporan.1 | `CetakLaporanController@cetak1` | web, auth, menu.permission |
| POST | `cetak/laporan/1/narasi` | cetak.laporan.1.narasi | `CetakLaporanController@simpanNarasi1` | web, auth, menu.permission |
| GET | `cetak/laporan/1/pdf` | cetak.laporan.1.pdf | `CetakLaporanController@pdf1` | web, auth, menu.permission |
| GET | `cetak/laporan/2` | cetak.laporan.2 | `CetakLaporanController@cetak2` | web, auth, menu.permission |
| POST | `cetak/laporan/2/narasi` | cetak.laporan.2.narasi | `CetakLaporanController@simpanNarasi2` | web, auth, menu.permission |
| GET | `cetak/laporan/2/pdf` | cetak.laporan.2.pdf | `CetakLaporanController@pdf2` | web, auth, menu.permission |
| GET | `cetak/laporan/3` | cetak.laporan.3 | `CetakLaporanController@cetak3` | web, auth, menu.permission |
| POST | `cetak/laporan/3/narasi` | cetak.laporan.3.narasi | `CetakLaporanController@simpanNarasi3` | web, auth, menu.permission |
| GET | `cetak/laporan/3/pdf` | cetak.laporan.3.pdf | `CetakLaporanController@pdf3` | web, auth, menu.permission |
| GET | `cetak/laporan/4` | cetak.laporan.4 | `CetakLaporanController@cetak4` | web, auth, menu.permission |
| POST | `cetak/laporan/4/narasi` | cetak.laporan.4.narasi | `CetakLaporanController@simpanNarasi4` | web, auth, menu.permission |
| GET | `cetak/laporan/4/pdf` | cetak.laporan.4.pdf | `CetakLaporanController@pdf4` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/10` | cetak.monev.10 | `CetakMonitoringEvaluasiController@cetak10` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/10/pdf` | cetak.monev.10.pdf | `CetakMonitoringEvaluasiController@pdf10` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/8` | cetak.monev.8 | `CetakMonitoringEvaluasiController@cetak8` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/8/pdf` | cetak.monev.8.pdf | `CetakMonitoringEvaluasiController@pdf8` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/9` | cetak.monev.9 | `CetakMonitoringEvaluasiController@cetak9` | web, auth, menu.permission |
| GET | `cetak/monitoring-evaluasi/9/pdf` | cetak.monev.9.pdf | `CetakMonitoringEvaluasiController@pdf9` | web, auth, menu.permission |
| GET | `cetak/risiko/2a` | cetak.risiko.2a | `CetakRisikoController@cetak2a` | web, auth, menu.permission |
| GET | `cetak/risiko/2a/pdf` | cetak.risiko.2a.pdf | `CetakRisikoController@pdf2a` | web, auth, menu.permission |
| GET | `cetak/risiko/2b` | cetak.risiko.2b | `CetakRisikoController@cetak2b` | web, auth, menu.permission |
| GET | `cetak/risiko/2b/pdf` | cetak.risiko.2b.pdf | `CetakRisikoController@pdf2b` | web, auth, menu.permission |
| GET | `cetak/risiko/2c` | cetak.risiko.2c | `CetakRisikoController@cetak2c` | web, auth, menu.permission |
| GET | `cetak/risiko/2c/pdf` | cetak.risiko.2c.pdf | `CetakRisikoController@pdf2c` | web, auth, menu.permission |
| GET | `cetak/risiko/3a` | cetak.risiko.3a | `CetakRisikoController@cetak3a` | web, auth, menu.permission |
| GET | `cetak/risiko/3a/pdf` | cetak.risiko.3a.pdf | `CetakRisikoController@pdf3a` | web, auth, menu.permission |
| GET | `cetak/risiko/3b` | cetak.risiko.3b | `CetakRisikoController@cetak3b` | web, auth, menu.permission |
| GET | `cetak/risiko/3b/pdf` | cetak.risiko.3b.pdf | `CetakRisikoController@pdf3b` | web, auth, menu.permission |
| GET | `cetak/risiko/3c` | cetak.risiko.3c | `CetakRisikoController@cetak3c` | web, auth, menu.permission |
| GET | `cetak/risiko/3c/pdf` | cetak.risiko.3c.pdf | `CetakRisikoController@pdf3c` | web, auth, menu.permission |
| GET | `cetak/risiko/4` | cetak.risiko.4 | `CetakHasilAnalisisController@cetak4` | web, auth, menu.permission |
| GET | `cetak/risiko/4/pdf` | cetak.risiko.4.pdf | `CetakHasilAnalisisController@pdf4` | web, auth, menu.permission |
| GET | `cetak/risiko/5` | cetak.risiko.5 | `CetakHasilAnalisisController@cetak5` | web, auth, menu.permission |
| GET | `cetak/risiko/5/pdf` | cetak.risiko.5.pdf | `CetakHasilAnalisisController@pdf5` | web, auth, menu.permission |
| GET | `cetak/risiko/6` | cetak.risiko.6 | `CetakRtpController@cetak6` | web, auth, menu.permission |
| GET | `cetak/risiko/6/pdf` | cetak.risiko.6.pdf | `CetakRtpController@pdf6` | web, auth, menu.permission |
| GET | `cetak/risiko/7` | cetak.risiko.7 | `CetakRtpController@cetak7` | web, auth, menu.permission |
| GET | `cetak/risiko/7/pdf` | cetak.risiko.7.pdf | `CetakRtpController@pdf7` | web, auth, menu.permission |
| PATCH | `cetak/risiko/ttd/{dataUmum}` | cetak.risiko.ttd.update | `CetakRisikoController@updateTtd` | web, auth, menu.permission |
| GET | `cetak/struktur-pengelolaan-risiko` | cetak.struktur.index | `CetakStrukturPengelolaController@index` | web, auth, menu.permission |
| POST | `cetak/struktur-pengelolaan-risiko` | cetak.struktur.store | `CetakStrukturPengelolaController@store` | web, auth, menu.permission |
| GET | `cetak/struktur-pengelolaan-risiko/pdf` | cetak.struktur.pdf | `CetakStrukturPengelolaController@pdf` | web, auth, menu.permission |
| POST | `cetak/struktur-pengelolaan-risiko/salin` | cetak.struktur.salin | `CetakStrukturPengelolaController@salinDariTahunLalu` | web, auth, menu.permission |
| DELETE | `cetak/struktur-pengelolaan-risiko/{struktur}` | cetak.struktur.destroy | `CetakStrukturPengelolaController@destroy` | web, auth, menu.permission |
| PUT | `cetak/struktur-pengelolaan-risiko/{struktur}` | cetak.struktur.update | `CetakStrukturPengelolaController@update` | web, auth, menu.permission |
| GET | `confirm-password` | password.confirm | `Auth\ConfirmablePasswordController@show` | web, auth |
| POST | `confirm-password` |  | `Auth\ConfirmablePasswordController@store` | web, auth |
| GET | `dashboard` | dashboard | `DashboardController@index` | web, auth, menu.permission |
| GET | `data-risiko-gabungan` | data_risiko_gabungan.index | `DataRisikoGabunganController@index` | web, auth, menu.permission |
| GET | `data-umum` | data-umum.index | `DataUmumController@index` | web, auth, menu.permission |
| POST | `data-umum` | data-umum.store | `DataUmumController@store` | web, auth, menu.permission |
| PATCH | `data-umum/{dataUmum}/penandatangan` | data-umum.penandatangan.update | `DataUmumController@updatePenandatangan` | web, auth, menu.permission |
| GET | `dua-faktor` | dua-faktor.tampil | `Auth\DuaFaktorTantanganController@tampil` | web, auth |
| POST | `dua-faktor` | dua-faktor.kirim | `Auth\DuaFaktorTantanganController@kirim` | web, auth, throttle:6,1 |
| POST | `dua-faktor/batal` | dua-faktor.batal | `Auth\DuaFaktorTantanganController@batal` | web, auth |
| POST | `email/verification-notification` | verification.send | `Auth\EmailVerificationNotificationController@store` | web, auth, throttle:6,1 |
| GET | `erpika/aneva` | erpika.aneva.index | `Erpika\AnevaController@index` | web, auth, menu.permission |
| GET | `erpika/aneva/cetak` | erpika.aneva.cetak | `Erpika\AnevaController@cetak` | web, auth, menu.permission |
| GET | `erpika/aneva/cetak/excel` | erpika.aneva.cetak.excel | `Erpika\AnevaController@excel` | web, auth, menu.permission |
| GET | `erpika/aneva/cetak/preview` | erpika.aneva.cetak.preview | `Erpika\AnevaController@previewCetak` | web, auth, menu.permission |
| GET | `erpika/arep` | erpika.arep | `Closure` | web, auth, menu.permission |
| GET | `erpika/beban-kerja` | erpika.beban-kerja | `Erpika\AnalisisController@bebanKerja` | web, auth, menu.permission |
| GET | `erpika/data-terhapus` | erpika.data-terhapus.index | `Erpika\DataTerhapusController@index` | web, auth, menu.permission |
| DELETE | `erpika/data-terhapus/{type}/{id}` | erpika.data-terhapus.force-delete | `Erpika\DataTerhapusController@forceDelete` | web, auth, menu.permission |
| PUT | `erpika/data-terhapus/{type}/{id}/restore` | erpika.data-terhapus.restore | `Erpika\DataTerhapusController@restore` | web, auth, menu.permission |
| GET | `erpika/kalender` | erpika.kalender | `Erpika\AnalisisController@kalender` | web, auth, menu.permission |
| GET | `erpika/laporan-penugasan` | erpika.laporan-penugasan | `Closure` | web, auth, menu.permission |
| GET | `erpika/pegawai` | erpika.pegawai.index | `Erpika\PegawaiController@index` | web, auth, menu.permission |
| POST | `erpika/pegawai` | erpika.pegawai.store | `Erpika\PegawaiController@store` | web, auth, menu.permission |
| DELETE | `erpika/pegawai/{employee}` | erpika.pegawai.destroy | `Erpika\PegawaiController@destroy` | web, auth, menu.permission |
| PUT | `erpika/pegawai/{employee}` | erpika.pegawai.update | `Erpika\PegawaiController@update` | web, auth, menu.permission |
| GET | `erpika/pegawai/{employee}/ringkasan` | erpika.pegawai.ringkasan | `Erpika\PegawaiController@ringkasan` | web, auth, menu.permission |
| GET | `erpika/pemeriksaan` | erpika.pemeriksaan | `Erpika\AnalisisController@pemeriksaan` | web, auth, menu.permission |
| GET | `files` | files.index | `UserFileController@index` | web, auth, menu.permission |
| POST | `files` | files.store | `UserFileController@store` | web, auth, menu.permission |
| DELETE | `files/{id}` | files.destroy | `UserFileController@destroy` | web, auth, menu.permission |
| POST | `files/{id}/approve` | files.approve | `UserFileController@approve` | web, auth, menu.permission |
| POST | `files/{id}/reject` | files.reject | `UserFileController@reject` | web, auth, menu.permission |
| GET | `forgot-password` | password.request | `Auth\PasswordResetLinkController@create` | web, guest |
| POST | `forgot-password` | password.email | `Auth\PasswordResetLinkController@store` | web, guest |
| POST | `fraud` | fraud.store | `FraudRisikoController@store` | web, auth, menu.permission |
| GET | `fraud/analisis` | fraud.analisis | `FraudRisikoController@analisis` | web, auth, menu.permission |
| GET | `fraud/cetak` | fraud.cetak | `FraudRisikoController@cetak` | web, auth, menu.permission |
| GET | `fraud/cetak/pdf` | fraud.cetak.pdf | `FraudRisikoController@pdf` | web, auth, menu.permission |
| GET | `fraud/identifikasi` | fraud.identifikasi | `FraudRisikoController@identifikasi` | web, auth, menu.permission |
| GET | `fraud/kamus` | fraud.kamus | `FraudRisikoController@kamus` | web, auth, menu.permission |
| GET | `fraud/peta-risiko` | fraud.peta | `FraudRisikoController@peta` | web, auth, menu.permission |
| GET | `fraud/register` | fraud.register | `FraudRisikoController@register` | web, auth, menu.permission |
| GET | `fraud/rekap-lapor` | fraud.rekap-lapor | `LaporanKecuranganController@index` | web, auth, menu.permission |
| DELETE | `fraud/rekap-lapor/{laporanKecurangan}` | fraud.rekap-lapor.destroy | `LaporanKecuranganController@destroy` | web, auth, menu.permission |
| GET | `fraud/rekap-lapor/{laporanKecurangan}/bukti/{media}` | fraud.rekap-lapor.bukti | `LaporanKecuranganController@unduhBukti` | web, auth, menu.permission |
| PUT | `fraud/rekap-lapor/{laporanKecurangan}/status` | fraud.rekap-lapor.status | `LaporanKecuranganController@updateStatus` | web, auth, menu.permission |
| POST | `fraud/rekap-lapor/{laporanKecurangan}/tanya` | fraud.rekap-lapor.tanya | `LaporanKecuranganController@tanya` | web, auth, menu.permission |
| GET | `fraud/rtp` | fraud.rtp | `FraudRisikoController@rtp` | web, auth, menu.permission |
| DELETE | `fraud/{fraudRisiko}` | fraud.destroy | `FraudRisikoController@destroy` | web, auth, menu.permission |
| PUT | `fraud/{fraudRisiko}` | fraud.update | `FraudRisikoController@update` | web, auth, menu.permission |
| GET | `iro_pd` | iro_pd.index | `IroPdController@index` | web, auth, menu.permission |
| POST | `iro_pd` | iro_pd.store | `IroPdController@store` | web, auth, menu.permission |
| DELETE | `iro_pd/{iro_pd}` | iro_pd.destroy | `IroPdController@destroy` | web, auth, menu.permission |
| PUT | `iro_pd/{iro_pd}` | iro_pd.update | `IroPdController@update` | web, auth, menu.permission |
| GET | `irs_pd` | irs_pd.index | `IrsPdController@index` | web, auth, menu.permission |
| POST | `irs_pd` | irs_pd.store | `IrsPdController@store` | web, auth, menu.permission |
| DELETE | `irs_pd/{irs_pd}` | irs_pd.destroy | `IrsPdController@destroy` | web, auth, menu.permission |
| PUT | `irs_pd/{irs_pd}` | irs_pd.update | `IrsPdController@update` | web, auth, menu.permission |
| GET | `irs_pemda` | irs_pemda.index | `IrsPemdaController@index` | web, auth, menu.permission |
| POST | `irs_pemda` | irs_pemda.store | `IrsPemdaController@store` | web, auth, menu.permission |
| DELETE | `irs_pemda/{irs_pemda}` | irs_pemda.destroy | `IrsPemdaController@destroy` | web, auth, menu.permission |
| PUT | `irs_pemda/{irs_pemda}` | irs_pemda.update | `IrsPemdaController@update` | web, auth, menu.permission |
| GET | `keterangan-pendukung` | keterangan-pendukung.index | `KeteranganPendukungController@index` | web, auth, menu.permission |
| POST | `keterangan-pendukung/arahan` | keterangan-pendukung.arahan.store | `KeteranganPendukungController@storeArahan` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/arahan/{arahan}` | keterangan-pendukung.arahan.destroy | `KeteranganPendukungController@destroyArahan` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/arahan/{arahan}` | keterangan-pendukung.arahan.update | `KeteranganPendukungController@updateArahan` | web, auth, menu.permission |
| POST | `keterangan-pendukung/arahan/{arahan}/tahapan` | keterangan-pendukung.tahapan.store | `KeteranganPendukungController@storeTahapan` | web, auth, menu.permission |
| POST | `keterangan-pendukung/entitas-penilai` | keterangan-pendukung.entitas-penilai.store | `KeteranganPendukungController@storeEntitasPenilai` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/entitas-penilai/{entitas}` | keterangan-pendukung.entitas-penilai.destroy | `KeteranganPendukungController@destroyEntitasPenilai` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/entitas-penilai/{entitas}` | keterangan-pendukung.entitas-penilai.update | `KeteranganPendukungController@updateEntitasPenilai` | web, auth, menu.permission |
| POST | `keterangan-pendukung/jenis-risiko` | keterangan-pendukung.jenis-risiko.store | `KeteranganPendukungController@storeJenisRisiko` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/jenis-risiko/{jenis}` | keterangan-pendukung.jenis-risiko.destroy | `KeteranganPendukungController@destroyJenisRisiko` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/jenis-risiko/{jenis}` | keterangan-pendukung.jenis-risiko.update | `KeteranganPendukungController@updateJenisRisiko` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/kriteria-dampak/{criteria}` | keterangan-pendukung.kriteria-dampak.update | `KeteranganPendukungController@updateImpactCriteria` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/kriteria-kemungkinan/{criteria}` | keterangan-pendukung.kriteria-kemungkinan.update | `KeteranganPendukungController@updateLikelihoodCriteria` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/level-risiko/{level}` | keterangan-pendukung.level-risiko.update | `KeteranganPendukungController@updateRiskLevel` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/matriks/{cell}` | keterangan-pendukung.matriks.update | `KeteranganPendukungController@updateMatrixCell` | web, auth, menu.permission |
| POST | `keterangan-pendukung/opd` | keterangan-pendukung.opd.store | `KeteranganPendukungController@storeOpd` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/opd/{opd}` | keterangan-pendukung.opd.destroy | `KeteranganPendukungController@destroyOpd` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/opd/{opd}` | keterangan-pendukung.opd.update | `KeteranganPendukungController@updateOpd` | web, auth, menu.permission |
| POST | `keterangan-pendukung/program-pembangunan` | keterangan-pendukung.program-pembangunan.store | `KeteranganPendukungController@storeProgramPembangunan` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/program-pembangunan/{program}` | keterangan-pendukung.program-pembangunan.destroy | `KeteranganPendukungController@destroyProgramPembangunan` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/program-pembangunan/{program}` | keterangan-pendukung.program-pembangunan.update | `KeteranganPendukungController@updateProgramPembangunan` | web, auth, menu.permission |
| DELETE | `keterangan-pendukung/tahapan/{tahapan}` | keterangan-pendukung.tahapan.destroy | `KeteranganPendukungController@destroyTahapan` | web, auth, menu.permission |
| PUT | `keterangan-pendukung/tahapan/{tahapan}` | keterangan-pendukung.tahapan.update | `KeteranganPendukungController@updateTahapan` | web, auth, menu.permission |
| GET | `kro_iro_pd` | kro_iro_pd.index | `KaeresRoController@index` | web, auth, menu.permission |
| GET | `kro_iro_pd_visualisasi` | kro_iro_pd.visualization | `KaeresRoController@visualization` | web, auth, menu.permission |
| GET | `kro_iro_pd_visualisasi/embed` | kro_iro_pd.visualization.embed | `KaeresRoController@visualizationEmbed` | web, auth, menu.permission |
| GET | `kro_pd` | kro_pd.index | `KroPdController@index` | web, auth, menu.permission |
| POST | `kro_pd` | kro_pd.store | `KroPdController@store` | web, auth, menu.permission |
| POST | `kro_pd/import-from-krs-pd` | kro_pd.import_from_krs_pd | `KroPdController@importFromKrsPd` | web, auth, menu.permission |
| DELETE | `kro_pd/{kro_pd}` | kro_pd.destroy | `KroPdController@destroy` | web, auth, menu.permission |
| PUT | `kro_pd/{kro_pd}` | kro_pd.update | `KroPdController@update` | web, auth, menu.permission |
| DELETE | `kro_pd_node/delete` | kro_pd.delete_node | `KroPdController@deleteNode` | web, auth, menu.permission |
| PUT | `kro_pd_node/update` | kro_pd.update_node | `KroPdController@updateNode` | web, auth, menu.permission |
| GET | `krs-excel` | krs-excel.index | `KrsPicExcelController@index` | web, auth, menu.permission |
| GET | `krs-excel/export` | krs-excel.export | `KrsPicExcelController@export` | web, auth, menu.permission |
| POST | `krs-excel/import` | krs-excel.import | `KrsPicExcelController@import` | web, auth, menu.permission |
| POST | `krs-excel/import-requests/{importRequest}/approve` | krs-excel.import-requests.approve | `KrsPicExcelController@approve` | web, auth, menu.permission |
| POST | `krs-excel/import-requests/{importRequest}/reject` | krs-excel.import-requests.reject | `KrsPicExcelController@reject` | web, auth, menu.permission |
| GET | `krs-excel/template` | krs-excel.template | `KrsPicExcelController@template` | web, auth, menu.permission |
| GET | `krs_irs_pd` | krs_irs_pd.index | `KaeresPdController@index` | web, auth, menu.permission |
| GET | `krs_irs_pd_visualisasi` | krs_irs_pd.visualization | `KaeresPdController@visualization` | web, auth, menu.permission |
| GET | `krs_irs_pd_visualisasi/embed` | krs_irs_pd.visualization.embed | `KaeresPdController@visualizationEmbed` | web, auth, menu.permission |
| GET | `krs_irs_pemda` | krs_irs_pemda.index | `KaeresController@index` | web, auth, menu.permission |
| GET | `krs_irs_pemda_visualisasi` | krs_irs_pemda.visualization | `KaeresController@visualization` | web, auth, menu.permission |
| GET | `krs_irs_pemda_visualisasi/embed` | krs_irs_pemda.visualization.embed | `KaeresController@visualizationEmbed` | web, auth, menu.permission |
| GET | `krs_pd` | krs_pd.index | `KrsPdController@index` | web, auth, menu.permission |
| POST | `krs_pd` | krs_pd.store | `KrsPdController@store` | web, auth, menu.permission |
| DELETE | `krs_pd/{krs_pd}` | krs_pd.destroy | `KrsPdController@destroy` | web, auth, menu.permission |
| PUT | `krs_pd/{krs_pd}` | krs_pd.update | `KrsPdController@update` | web, auth, menu.permission |
| DELETE | `krs_pd_node/delete` | krs_pd.delete_node | `KrsPdController@deleteNode` | web, auth, menu.permission |
| PUT | `krs_pd_node/update` | krs_pd.update_node | `KrsPdController@updateNode` | web, auth, menu.permission |
| GET | `krs_pemda` | krs_pemda.index | `KrsPemdaController@index` | web, auth, menu.permission |
| POST | `krs_pemda` | krs_pemda.store | `KrsPemdaController@store` | web, auth, menu.permission |
| DELETE | `krs_pemda/{krs_pemda}` | krs_pemda.destroy | `KrsPemdaController@destroy` | web, auth, menu.permission |
| PUT | `krs_pemda/{krs_pemda}` | krs_pemda.update | `KrsPemdaController@update` | web, auth, menu.permission |
| DELETE | `krs_pemda_node/delete` | krs_pemda.delete_node | `KrsPemdaController@deleteNode` | web, auth, menu.permission |
| PUT | `krs_pemda_node/update` | krs_pemda.update_node | `KrsPemdaController@updateNode` | web, auth, menu.permission |
| POST | `lapor-kecurangan` | lapor-kecurangan.store | `LaporanKecuranganController@store` | web, auth, menu.permission, throttle:lapor-submit |
| POST | `lapor-kecurangan/balas` | lapor-kecurangan.balas | `LaporanKecuranganController@balasTiket` | web, auth, menu.permission, throttle:lapor-tiket |
| POST | `lapor-kecurangan/status` | lapor-kecurangan.status | `LaporanKecuranganController@cekStatus` | web, auth, menu.permission, throttle:lapor-tiket |
| GET | `lapor-kejadian` | lapor-kejadian.create | `LaporanKejadianController@create` | web, auth, menu.permission |
| POST | `lapor-kejadian` | lapor-kejadian.store | `LaporanKejadianController@store` | web, auth, menu.permission, throttle:lapor-submit |
| GET | `lapor-kejadian/cari-risiko` | lapor-kejadian.search-risiko | `LaporanKejadianController@searchRisiko` | web, auth, menu.permission, throttle:lapor-cari |
| GET | `lapor-kejadian/rekap` | lapor-kejadian.index | `LaporanKejadianController@index` | web, auth, menu.permission |
| DELETE | `lapor-kejadian/rekap/{laporanKejadian}` | lapor-kejadian.destroy | `LaporanKejadianController@destroy` | web, auth, menu.permission |
| PUT | `lapor-kejadian/rekap/{laporanKejadian}/opd` | lapor-kejadian.update-opd | `LaporanKejadianController@updateOpd` | web, auth, menu.permission |
| PUT | `lapor-kejadian/rekap/{laporanKejadian}/risiko-terdaftar` | lapor-kejadian.update-risiko-terdaftar | `LaporanKejadianController@updateRisikoTerdaftar` | web, auth, menu.permission |
| PUT | `lapor-kejadian/rekap/{laporanKejadian}/status` | lapor-kejadian.update-status | `LaporanKejadianController@updateStatus` | web, auth, menu.permission |
| GET | `login` | login | `Auth\AuthenticatedSessionController@create` | web, guest |
| POST | `login` |  | `Auth\AuthenticatedSessionController@store` | web, guest |
| GET | `login/cee-survey` | login.cee-survey | `Auth\CeeSurveyQrLoginController` | web, throttle:qr-login |
| GET | `login/lapor-kejadian` | login.lapor-kejadian | `Auth\LaporQrLoginController` | web, throttle:qr-login |
| POST | `logout` | logout | `Auth\AuthenticatedSessionController@destroy` | web, auth |
| POST | `media` | media.store | `MediaFolderController@store` | web, auth, menu.permission |
| GET | `media/{media}/download` | media.download | `MediaDownloadController` | web, auth, menu.permission |
| DELETE | `media/{medium}` | media.destroy | `MediaFolderController@destroy` | web, auth, menu.permission |
| GET | `menus` | menus.index | `MenuController@index` | web, auth, menu.permission |
| POST | `menus` | menus.store | `MenuController@store` | web, auth, menu.permission |
| GET | `menus/create` | menus.create | `MenuController@create` | web, auth, menu.permission |
| POST | `menus/reorder` | menus.reorder | `MenuController@reorder` | web, auth, menu.permission |
| DELETE | `menus/{menu}` | menus.destroy | `MenuController@destroy` | web, auth, menu.permission |
| PUT|PATCH | `menus/{menu}` | menus.update | `MenuController@update` | web, auth, menu.permission |
| GET | `menus/{menu}/edit` | menus.edit | `MenuController@edit` | web, auth, menu.permission |
| GET | `monitoring-evaluasi/10` | monitoring-evaluasi.form10 | `MonitoringEvaluasiController@form10` | web, auth, menu.permission |
| POST | `monitoring-evaluasi/10` | monitoring-evaluasi.form10.store | `MonitoringEvaluasiController@storeOrUpdate10` | web, auth, menu.permission |
| GET | `monitoring-evaluasi/8-9` | monitoring-evaluasi.form89 | `MonitoringEvaluasiController@form89` | web, auth, menu.permission |
| POST | `monitoring-evaluasi/8-9` | monitoring-evaluasi.form89.store | `MonitoringEvaluasiController@storeOrUpdate89` | web, auth, menu.permission |
| POST | `monitoring-evaluasi/kemiripan/abaikan` | monitoring-evaluasi.kemiripan.abaikan | `MonitoringEvaluasiController@abaikanKemiripan` | web, auth, menu.permission |
| GET | `notifications` | notifications.index | `NotificationController@index` | web, auth, menu.permission |
| POST | `notifications/read-all` | notifications.read-all | `NotificationController@markAllRead` | web, auth, menu.permission |
| POST | `notifications/{id}/read` | notifications.read | `NotificationController@markRead` | web, auth, menu.permission |
| GET | `panduan` | panduan | `PanduanController@index` | web, auth, menu.permission |
| GET | `panduan-publik` | panduan.public | `Closure` | web |
| GET | `panduan-publik/pdf` | panduan.public.pdf | `PanduanController@pdf` | web, throttle:6,1 |
| POST | `panduan/kuis` | panduan.kuis | `PanduanController@simpanKuis` | web, auth, menu.permission |
| GET | `pencarian` | pencarian | `PencarianController` | web, auth, menu.permission |
| GET | `permissions` | permissions.index | `PermissionController@index` | web, auth, menu.permission |
| POST | `permissions` | permissions.store | `PermissionController@store` | web, auth, menu.permission |
| GET | `permissions/create` | permissions.create | `PermissionController@create` | web, auth, menu.permission |
| DELETE | `permissions/{permission}` | permissions.destroy | `PermissionController@destroy` | web, auth, menu.permission |
| PUT|PATCH | `permissions/{permission}` | permissions.update | `PermissionController@update` | web, auth, menu.permission |
| GET | `permissions/{permission}/edit` | permissions.edit | `PermissionController@edit` | web, auth, menu.permission |
| GET | `pkpt` | pkpt.index | `Pkpt\PkptPeriodeController@index` | web, auth, menu.permission |
| GET | `pkpt/cetak/{formulir}` | pkpt.cetak | `Pkpt\CetakPkptController@cetak` | web, auth, menu.permission |
| GET | `pkpt/cetak/{formulir}/pdf` | pkpt.cetak.pdf | `Pkpt\CetakPkptController@pdf` | web, auth, menu.permission |
| GET | `pkpt/evaluasi-register` | pkpt.evaluasi-register.index | `Pkpt\PkptEvaluasiRisikoController@index` | web, auth, menu.permission |
| POST | `pkpt/evaluasi-register/terima` | pkpt.evaluasi-register.terima | `Pkpt\PkptEvaluasiRisikoController@terimaSemua` | web, auth, menu.permission |
| PUT | `pkpt/evaluasi-register/{tipe}/{id}` | pkpt.evaluasi-register.update | `Pkpt\PkptEvaluasiRisikoController@update` | web, auth, menu.permission |
| GET | `pkpt/faktor-risiko` | pkpt.faktor-risiko.index | `Pkpt\PkptFaktorRisikoController@index` | web, auth, menu.permission |
| POST | `pkpt/faktor-risiko/tarik-pagu` | pkpt.faktor-risiko.tarik-pagu | `Pkpt\PkptFaktorRisikoController@tarikPagu` | web, auth, menu.permission |
| PUT | `pkpt/faktor-risiko/{area}` | pkpt.faktor-risiko.update | `Pkpt\PkptFaktorRisikoController@update` | web, auth, menu.permission |
| POST | `pkpt/hitung` | pkpt.hitung | `Pkpt\PkptPenilaianController@hitung` | web, auth, menu.permission |
| GET | `pkpt/jakwas` | pkpt.jakwas | `Pkpt\PkptRencanaController@jakwas` | web, auth, menu.permission |
| GET | `pkpt/kematangan-mr` | pkpt.kematangan-mr.index | `Pkpt\PkptKematanganController@index` | web, auth, menu.permission |
| POST | `pkpt/kematangan-mr/adopsi-spip` | pkpt.kematangan-mr.adopsi | `Pkpt\PkptKematanganController@adopsiSpip` | web, auth, menu.permission |
| PUT | `pkpt/kematangan-mr/{opd}` | pkpt.kematangan-mr.update | `Pkpt\PkptKematanganController@update` | web, auth, menu.permission |
| GET | `pkpt/pengaturan` | pkpt.pengaturan.index | `Pkpt\PkptPengaturanController@index` | web, auth, menu.permission |
| POST | `pkpt/pengaturan/bobot-faktor` | pkpt.pengaturan.bobot-faktor | `Pkpt\PkptPengaturanController@simpanBobotFaktor` | web, auth, menu.permission |
| POST | `pkpt/pengaturan/bobot-kematangan` | pkpt.pengaturan.bobot-kematangan | `Pkpt\PkptPengaturanController@simpanBobotKematangan` | web, auth, menu.permission |
| POST | `pkpt/pengaturan/sektor-unggulan` | pkpt.pengaturan.sektor.store | `Pkpt\PkptPengaturanController@tambahSektorUnggulan` | web, auth, menu.permission |
| DELETE | `pkpt/pengaturan/sektor-unggulan/{sektor}` | pkpt.pengaturan.sektor.destroy | `Pkpt\PkptPengaturanController@hapusSektorUnggulan` | web, auth, menu.permission |
| GET | `pkpt/penugasan-wajib` | pkpt.penugasan-wajib.index | `Pkpt\PkptPenugasanWajibController@index` | web, auth, menu.permission |
| POST | `pkpt/penugasan-wajib` | pkpt.penugasan-wajib.store | `Pkpt\PkptPenugasanWajibController@store` | web, auth, menu.permission |
| DELETE | `pkpt/penugasan-wajib/{penugasan}` | pkpt.penugasan-wajib.destroy | `Pkpt\PkptPenugasanWajibController@destroy` | web, auth, menu.permission |
| PUT | `pkpt/penugasan-wajib/{penugasan}` | pkpt.penugasan-wajib.update | `Pkpt\PkptPenugasanWajibController@update` | web, auth, menu.permission |
| GET | `pkpt/peringkat` | pkpt.peringkat | `Pkpt\PkptPenilaianController@peringkat` | web, auth, menu.permission |
| PUT | `pkpt/peringkat/{penilaian}/tahun` | pkpt.peringkat.tahun | `Pkpt\PkptPenilaianController@simpanRencanaTahun` | web, auth, menu.permission |
| POST | `pkpt/periode` | pkpt.periode.store | `Pkpt\PkptPeriodeController@store` | web, auth, menu.permission |
| PUT | `pkpt/periode/{periode}` | pkpt.periode.update | `Pkpt\PkptPeriodeController@update` | web, auth, menu.permission |
| POST | `pkpt/periode/{periode}/buka` | pkpt.periode.buka | `Pkpt\PkptPeriodeController@bukaKembali` | web, auth, menu.permission |
| POST | `pkpt/periode/{periode}/tetapkan` | pkpt.periode.tetapkan | `Pkpt\PkptPeriodeController@tetapkan` | web, auth, menu.permission |
| GET | `pkpt/peta-auditan` | pkpt.peta-auditan.index | `Pkpt\PkptPetaAuditanController@index` | web, auth, menu.permission |
| POST | `pkpt/peta-auditan` | pkpt.peta-auditan.store | `Pkpt\PkptPetaAuditanController@store` | web, auth, menu.permission |
| POST | `pkpt/peta-auditan/tarik` | pkpt.peta-auditan.tarik | `Pkpt\PkptPetaAuditanController@tarik` | web, auth, menu.permission |
| DELETE | `pkpt/peta-auditan/{area}` | pkpt.peta-auditan.destroy | `Pkpt\PkptPetaAuditanController@destroy` | web, auth, menu.permission |
| PUT | `pkpt/peta-auditan/{area}` | pkpt.peta-auditan.update | `Pkpt\PkptPetaAuditanController@update` | web, auth, menu.permission |
| GET | `pkpt/program-kerja` | pkpt.program-kerja | `Pkpt\PkptRencanaController@programKerja` | web, auth, menu.permission |
| POST | `pkpt/rencana` | pkpt.rencana.store | `Pkpt\PkptRencanaController@store` | web, auth, menu.permission |
| POST | `pkpt/rencana/tarik-peringkat` | pkpt.rencana.tarik | `Pkpt\PkptRencanaController@tarikDariPeringkat` | web, auth, menu.permission |
| DELETE | `pkpt/rencana/{rencana}` | pkpt.rencana.destroy | `Pkpt\PkptRencanaController@destroy` | web, auth, menu.permission |
| PUT | `pkpt/rencana/{rencana}` | pkpt.rencana.update | `Pkpt\PkptRencanaController@update` | web, auth, menu.permission |
| GET | `pkpt/total-nilai` | pkpt.total-nilai | `Pkpt\PkptPenilaianController@totalNilai` | web, auth, menu.permission |
| GET | `program-bupati-risiko` | program-bupati-risiko.index | `ProgramBupatiRisikoController@index` | web, auth, menu.permission |
| GET | `program-bupati-risiko/cari-risiko` | program-bupati-risiko.cari-risiko | `ProgramBupatiRisikoController@searchRisiko` | web, auth, menu.permission |
| GET | `program-bupati-risiko/cetak` | program-bupati-risiko.cetak | `ProgramBupatiRisikoController@cetak` | web, auth, menu.permission |
| GET | `program-bupati-risiko/cetak/pdf` | program-bupati-risiko.cetak.pdf | `ProgramBupatiRisikoController@pdf` | web, auth, menu.permission |
| DELETE | `program-bupati-risiko/risiko/{pivot}` | program-bupati-risiko.risiko.destroy | `ProgramBupatiRisikoController@destroyRisiko` | web, auth, menu.permission |
| POST | `program-bupati-risiko/usulan/{usulan}/setujui` | program-bupati-risiko.usulan.setujui | `ProgramBupatiRisikoController@setujuiUsulan` | web, auth, menu.permission |
| POST | `program-bupati-risiko/usulan/{usulan}/tolak` | program-bupati-risiko.usulan.tolak | `ProgramBupatiRisikoController@tolakUsulan` | web, auth, menu.permission |
| POST | `program-bupati-risiko/{program}/risiko` | program-bupati-risiko.risiko.store | `ProgramBupatiRisikoController@storeRisiko` | web, auth, menu.permission |
| POST | `reset-password` | password.store | `Auth\NewPasswordController@store` | web, guest |
| GET | `reset-password/{token}` | password.reset | `Auth\NewPasswordController@create` | web, guest |
| GET | `risk-evidence/{type}/{id}` | risk-evidence.index | `RiskEvidenceController@index` | web, auth, menu.permission |
| POST | `risk-evidence/{type}/{id}` | risk-evidence.store | `RiskEvidenceController@store` | web, auth, menu.permission |
| DELETE | `risk-evidence/{type}/{id}/{mediaId}` | risk-evidence.destroy | `RiskEvidenceController@destroy` | web, auth, menu.permission |
| GET | `riwayat/{jenis}/{id}` | riwayat.baris | `RiwayatBarisController` | web, auth, menu.permission |
| GET | `robots.txt` | robots | `Closure` | web |
| GET | `roles` | roles.index | `RoleController@index` | web, auth, menu.permission |
| POST | `roles` | roles.store | `RoleController@store` | web, auth, menu.permission |
| GET | `roles/create` | roles.create | `RoleController@create` | web, auth, menu.permission |
| DELETE | `roles/{role}` | roles.destroy | `RoleController@destroy` | web, auth, menu.permission |
| PUT|PATCH | `roles/{role}` | roles.update | `RoleController@update` | web, auth, menu.permission |
| GET | `roles/{role}/edit` | roles.edit | `RoleController@edit` | web, auth, menu.permission |
| GET | `rpp` | rpp.index | `RppController@index` | web, auth, menu.permission |
| POST | `rpp` | rpp.store | `RppController@store` | web, auth, menu.permission |
| GET | `rpp-cetak/{rpp}/pengantar` | rpp-cetak.pengantar | `RppPrintController@pengantar` | web, auth, menu.permission |
| GET | `rpp-cetak/{rpp}/pengantar/preview` | rpp-cetak.pengantar.preview | `RppPrintController@previewPengantar` | web, auth, menu.permission |
| GET | `rpp-cetak/{rpp}/tabel` | rpp-cetak.tabel | `RppPrintController@tabel` | web, auth, menu.permission |
| GET | `rpp-cetak/{rpp}/tabel/excel` | rpp-cetak.tabel.excel | `RppPrintController@excel` | web, auth, menu.permission |
| GET | `rpp-cetak/{rpp}/tabel/preview` | rpp-cetak.tabel.preview | `RppPrintController@previewTabel` | web, auth, menu.permission |
| GET | `rpp-pengaturan` | rpp-pengaturan.index | `RppPengaturanController@index` | web, auth, menu.permission |
| PUT | `rpp-pengaturan` | rpp-pengaturan.update | `RppPengaturanController@updateSetting` | web, auth, menu.permission |
| GET | `rpp/create` | rpp.create | `RppController@create` | web, auth, menu.permission |
| DELETE | `rpp/{rpp}` | rpp.destroy | `RppController@destroy` | web, auth, menu.permission |
| PUT|PATCH | `rpp/{rpp}` | rpp.update | `RppController@update` | web, auth, menu.permission |
| GET | `rpp/{rpp}/edit` | rpp.edit | `RppController@edit` | web, auth, menu.permission |
| POST | `session-extend` | session.extend | `SessionStatusController@extend` | web, auth, menu.permission |
| GET | `session-status` | session.status | `SessionStatusController@show` | web, auth, menu.permission |
| GET|POST|PUT|PATCH|DELETE|OPTIONS | `settings` |  | `\Illuminate\Routing\RedirectController` | web, auth |
| GET | `settings/appearance` | appearance | `Closure` | web, auth |
| DELETE | `settings/dua-faktor` | dua-faktor.matikan | `Settings\DuaFaktorController@matikan` | web, auth |
| POST | `settings/dua-faktor/kode-pemulihan` | dua-faktor.kode-pemulihan | `Settings\DuaFaktorController@kodePemulihanBaru` | web, auth |
| POST | `settings/dua-faktor/nyalakan` | dua-faktor.nyalakan | `Settings\DuaFaktorController@nyalakan` | web, auth |
| POST | `settings/dua-faktor/siapkan` | dua-faktor.siapkan | `Settings\DuaFaktorController@siapkan` | web, auth |
| GET | `settings/password` | password.edit | `Settings\PasswordController@edit` | web, auth |
| PUT | `settings/password` | password.update | `Settings\PasswordController@update` | web, auth |
| GET | `settings/profile` | profile.edit | `Settings\ProfileController@edit` | web, auth |
| PATCH | `settings/profile` | profile.update | `Settings\ProfileController@update` | web, auth |
| GET | `settingsapp` | setting.edit | `SettingAppController@edit` | web, auth, menu.permission |
| POST | `settingsapp` | setting.update | `SettingAppController@update` | web, auth, menu.permission |
| GET | `sitemap.xml` | sitemap | `Closure` | web |
| GET | `status` | status | `StatusController` | web |
| POST | `tahun-aktif` | tahun-aktif.update | `TahunAktifController@update` | web, auth, menu.permission |
| GET | `trash` | trash.index | `TrashController@index` | web, auth, menu.permission |
| PUT | `trash/{type}/batch/{batch}/restore` | trash.restore-batch | `TrashController@restoreBatch` | web, auth, menu.permission |
| DELETE | `trash/{type}/{id}` | trash.force-delete | `TrashController@forceDelete` | web, auth, menu.permission |
| PUT | `trash/{type}/{id}/restore` | trash.restore | `TrashController@restore` | web, auth, menu.permission |
| GET | `troubleshoot` | troubleshoot.index | `TroubleshootReportController@index` | web, auth, menu.permission |
| POST | `troubleshoot-report` | troubleshoot.store | `TroubleshootReportController@store` | web, auth, menu.permission |
| DELETE | `troubleshoot/{troubleshoot}` | troubleshoot.destroy | `TroubleshootReportController@destroy` | web, auth, menu.permission |
| PUT | `troubleshoot/{troubleshoot}/status` | troubleshoot.update-status | `TroubleshootReportController@updateStatus` | web, auth, menu.permission |
| GET | `up` |  | `Closure` |  |
| GET | `users` | users.index | `UserController@index` | web, auth, menu.permission |
| POST | `users` | users.store | `UserController@store` | web, auth, menu.permission |
| GET | `users/create` | users.create | `UserController@create` | web, auth, menu.permission |
| DELETE | `users/{user}` | users.destroy | `UserController@destroy` | web, auth, menu.permission |
| PUT|PATCH | `users/{user}` | users.update | `UserController@update` | web, auth, menu.permission |
| GET | `users/{user}/edit` | users.edit | `UserController@edit` | web, auth, menu.permission |
| PUT | `users/{user}/reset-password` | users.reset-password | `UserController@resetPassword` | web, auth, menu.permission |
| GET | `verify-email` | verification.notice | `Auth\EmailVerificationPromptController` | web, auth |
| GET | `verify-email/{id}/{hash}` | verification.verify | `Auth\VerifyEmailController` | web, auth, signed, throttle:6,1 |
